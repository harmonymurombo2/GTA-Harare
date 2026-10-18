import * as THREE from 'three';
import { sound } from './audio';

export interface PlayerInputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  run: boolean;
  jump: boolean;
}

export class PlayerController {
  public camera: THREE.PerspectiveCamera;
  public position: THREE.Vector3 = new THREE.Vector3(0, 0, 16); // starting on avenue crosswalk looking towards civic center
  public velocity: THREE.Vector3 = new THREE.Vector3();
  public isGrounded: boolean = true;
  public isLocked: boolean = false;

  public pitch: number = 0;
  public yaw: number = Math.PI; // looking north

  public eyeHeight: number = 1.7;
  public playerRadius: number = 0.45;

  private walkSpeed: number = 4.8;
  private runSpeed: number = 9.2;
  private gravity: number = 22.0;
  private jumpSpeed: number = 7.5;

  private footstepTimer: number = 0;

  public input: PlayerInputState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    run: false,
    jump: false
  };

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.camera.rotation.order = 'YXZ';
    this.position.set(0, this.getGroundElevation(0, 16), 16);
    this.updateCameraTransform();
  }

  public getGroundElevation(x: number, z: number): number {
    // Central Plaza roundabout
    const distSq = x * x + z * z;
    if (distSq < 8.2 * 8.2) {
      return 0.35;
    }
    // Main Avenue Road Corridors (Samora Machel EW & Julius Nyerere NS)
    const roadHalfWidth = 10.2;
    if (Math.abs(x) < roadHalfWidth || Math.abs(z) < roadHalfWidth) {
      return 0.0;
    }
    // Sidewalks
    return 0.22;
  }

  public onMouseMove(dx: number, dy: number, sensitivity: number = 0.0022) {
    if (!this.isLocked) return;

    this.yaw -= dx * sensitivity;
    this.pitch -= dy * sensitivity;

    // Clamp vertical look between -85 deg and +85 deg
    const maxPitch = (85 * Math.PI) / 180;
    this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));

    this.updateCameraTransform();
  }

  public update(dt: number, collisionBoxes: THREE.Box3[]) {
    // Cap dt for lag spikes
    const delta = Math.min(dt, 0.05);

    // 1. Calculate horizontal movement direction relative to camera yaw
    const forwardX = -Math.sin(this.yaw);
    const forwardZ = -Math.cos(this.yaw);
    const rightX = Math.cos(this.yaw);
    const rightZ = -Math.sin(this.yaw);

    let moveX = 0;
    let moveZ = 0;

    if (this.input.forward) {
      moveX += forwardX;
      moveZ += forwardZ;
    }
    if (this.input.backward) {
      moveX -= forwardX;
      moveZ -= forwardZ;
    }
    if (this.input.right) {
      moveX += rightX;
      moveZ += rightZ;
    }
    if (this.input.left) {
      moveX -= rightX;
      moveZ -= rightZ;
    }

    const moveLen = Math.hypot(moveX, moveZ);
    const isMoving = moveLen > 0.001;

    const currentSpeed = this.input.run ? this.runSpeed : this.walkSpeed;

    if (isMoving) {
      const normX = (moveX / moveLen) * currentSpeed;
      const normZ = (moveZ / moveLen) * currentSpeed;
      this.velocity.x = normX;
      this.velocity.z = normZ;
    } else {
      // Damping
      this.velocity.x *= 0.75;
      this.velocity.z *= 0.75;
      if (Math.abs(this.velocity.x) < 0.01) this.velocity.x = 0;
      if (Math.abs(this.velocity.z) < 0.01) this.velocity.z = 0;
    }

    // 2. Jump & Vertical Gravity
    if (this.input.jump && this.isGrounded) {
      this.velocity.y = this.jumpSpeed;
      this.isGrounded = false;
      sound.playJump();
    }

    if (!this.isGrounded) {
      this.velocity.y -= this.gravity * delta;
    }

    // 3. Collision Resolution with sliding
    const nextPosX = this.position.x + this.velocity.x * delta;
    const nextPosZ = this.position.z + this.velocity.z * delta;
    const nextPosY = this.position.y + this.velocity.y * delta;

    // Test X movement independently for smooth sliding against walls
    if (!this.checkBuildingCollision(nextPosX, this.position.z, collisionBoxes)) {
      this.position.x = nextPosX;
    } else {
      this.velocity.x = 0;
    }

    // Test Z movement independently
    if (!this.checkBuildingCollision(this.position.x, nextPosZ, collisionBoxes)) {
      this.position.z = nextPosZ;
    } else {
      this.velocity.z = 0;
    }

    // 4. Ground Elevation & Landing
    const groundElevation = this.getGroundElevation(this.position.x, this.position.z);

    if (nextPosY <= groundElevation) {
      if (!this.isGrounded && this.velocity.y < -3.5) {
        sound.playLand();
      }
      this.position.y = groundElevation;
      this.velocity.y = 0;
      this.isGrounded = true;
    } else {
      this.position.y = nextPosY;
      // If we walked off a sidewalk curb into the road
      if (this.position.y - groundElevation > 0.05 && this.isGrounded) {
        // Step down smoothly
        this.position.y = groundElevation;
      }
    }

    // 5. Footstep Sound Synthesizer
    if (this.isGrounded && isMoving) {
      const stepInterval = this.input.run ? 0.32 : 0.48;
      this.footstepTimer += delta;
      if (this.footstepTimer >= stepInterval) {
        sound.playFootstep(this.input.run);
        this.footstepTimer = 0;
      }
    } else {
      this.footstepTimer = 0;
    }

    this.updateCameraTransform();
  }

  private checkBuildingCollision(x: number, z: number, collisionBoxes: THREE.Box3[]): boolean {
    const r = this.playerRadius;
    const pMinX = x - r;
    const pMaxX = x + r;
    const pMinZ = z - r;
    const pMaxZ = z + r;
    const pMinY = this.position.y;
    const pMaxY = this.position.y + this.eyeHeight;

    for (let i = 0; i < collisionBoxes.length; i++) {
      const b = collisionBoxes[i];
      // Overlap test
      if (
        pMaxX > b.min.x &&
        pMinX < b.max.x &&
        pMaxZ > b.min.z &&
        pMinZ < b.max.z &&
        pMaxY > b.min.y &&
        pMinY < b.max.y
      ) {
        return true;
      }
    }
    return false;
  }

  private updateCameraTransform() {
    this.camera.position.set(this.position.x, this.position.y + this.eyeHeight, this.position.z);
    this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
  }

  public resetPosition(x: number = 0, z: number = 16) {
    this.position.set(x, this.getGroundElevation(x, z), z);
    this.velocity.set(0, 0, 0);
    this.pitch = 0;
    this.yaw = Math.PI;
    this.isGrounded = true;
    this.updateCameraTransform();
  }
}
