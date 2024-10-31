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

export const WeaponClassNameToIdMap = {
	CWeaponPhysCannon: 1,
	CWeaponShotgun: 2,
	CWeapon357: 3,
	CWeaponPistol: 4,
	CWeaponSMG1: 5,
	CWeaponFrag: 6,
	CWeaponAR2: 7,
	CWeaponCrossbow: 8,
	CWeaponRPG: 9,
	CWeaponCrowbar: 10,
	CWeaponStunStick: 11,
}

export const WeaponIdToClassNameMap: { [id: number]: keyof typeof WeaponClassNameToIdMap } = invertObject(WeaponClassNameToIdMap);

function invertObject<T extends Record<string, number>>(obj: T): Record<T[keyof T], keyof T> {
	const inverted: Record<T[keyof T], keyof T> = {} as Record<T[keyof T], keyof T>;
	for (const key in obj) {
		inverted[obj[key]] = key as keyof T;
	}
	return inverted;
}
