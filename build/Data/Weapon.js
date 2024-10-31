"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeaponClassNameToIdMap = {
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
};
exports.WeaponIdToClassNameMap = invertObject(exports.WeaponClassNameToIdMap);
function invertObject(obj) {
    const inverted = {};
    for (const key in obj) {
        inverted[obj[key]] = key;
    }
    return inverted;
}
//# sourceMappingURL=Weapon.js.map