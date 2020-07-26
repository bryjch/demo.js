import { Vector } from "./Vector";

export interface Projectile {
  type: keyof typeof ProjectileTypeMap | number;
  position: Vector;
  rotation: Vector;
  teamNumber: number;
}

export const ProjectileServerClassMap: { [key: string]: number } = {
  CTFProjectile_Rocket: 1,
  CTFGrenadePipebombProjectile: 2, // Pipes & stickies are both classified as GrenadePipebomb...
  CTFProjectile_HealingBolt: 4,
};

export const ProjectileTypeMap: { [key: number]: string } = {
  1: "rocket",
  2: "pipebomb",
  3: "stickybomb",
  4: "healingBolt",
};
