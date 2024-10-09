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

export type Weapon = BaseCombatWeapon|
	CWeaponMedigun;
