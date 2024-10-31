export interface BaseCombatWeapon {
    entityId?: number;
    className: string;
    owner: number;
}
export interface CWeaponMedigun {
    entityId?: number;
    className: 'CWeaponMedigun';
    healTarget: number;
    chargeLevel: number;
}
export declare type Weapon = BaseCombatWeapon | CWeaponMedigun;
export declare const WeaponClassNameToIdMap: {
    CWeaponPhysCannon: number;
    CWeaponShotgun: number;
    CWeapon357: number;
    CWeaponPistol: number;
    CWeaponSMG1: number;
    CWeaponFrag: number;
    CWeaponAR2: number;
    CWeaponCrossbow: number;
    CWeaponRPG: number;
    CWeaponCrowbar: number;
    CWeaponStunStick: number;
};
export declare const WeaponIdToClassNameMap: {
    [id: number]: keyof typeof WeaponClassNameToIdMap;
};
