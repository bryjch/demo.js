import { Vector } from "./Vector";

export interface HL2DMProjectile {
  type: keyof typeof HL2DMProjectileTypeMap | number;
  position: Vector;
  rotation: Vector;
  teamNumber: number;
}

export const HL2DMProjectileServerClassMap: { [key: string]: number } = {
  CWeapon357: 1,
  CWeaponAR2: 2,
  CWeaponCrossbow: 3,
  CWeaponCrowbar: 4,
  CWeaponFrag: 5,
  CWeaponPhysCannon: 6,
  CWeaponPistol: 7,
  CWeaponRPG: 8,
  CWeaponSMG1: 9,
  CWeaponShotgun: 10,
  CWeaponStunStick: 11,
};

export const HL2DMProjectileTypeMap: { [key: number]: string } = {
  1: "357",
  2: "ar2",
  3: "crossbow",
  4: "crowbar",
  5: "frag",
  6: "physcannon",
  7: "pistol",
  8: "rpg",
  9: "smg",
  10: "shotgun",
  11: "stunstick",
};
