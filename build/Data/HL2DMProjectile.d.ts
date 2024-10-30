import { Vector } from "./Vector";
export interface HL2DMProjectile {
    type: keyof typeof HL2DMProjectileTypeMap | number;
    position: Vector;
    rotation: Vector;
    teamNumber: number;
}
export declare const HL2DMProjectileServerClassMap: {
    [key: string]: number;
};
export declare const HL2DMProjectileTypeMap: {
    [key: number]: string;
};
