"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vector_1 = require("./Vector");
var LifeState;
(function (LifeState) {
    LifeState[LifeState["ALIVE"] = 0] = "ALIVE";
    LifeState[LifeState["DYING"] = 1] = "DYING";
    LifeState[LifeState["DEATH"] = 2] = "DEATH";
    LifeState[LifeState["RESPAWNABLE"] = 3] = "RESPAWNABLE";
})(LifeState = exports.LifeState || (exports.LifeState = {}));
class Player {
    constructor(match, userInfo) {
        this.position = new Vector_1.Vector(0, 0, 0);
        this.viewAngles = new Vector_1.Vector(0, 0, 0);
        this.health = 0;
        this.maxHealth = 0;
        this.classId = 0;
        this.team = 0;
        this.viewAngle = 0;
        this.weaponIds = [];
        this.ammo = [];
        this.lifeState = LifeState.DEATH;
        this.activeWeapon = 0;
        this.match = match;
        this.user = userInfo;
    }
    get weapons() {
        // TF2 demos have the outer map, which makes it easier to map handle to `entityId`
        // whereas HL2DM ones don't, so an additional step of determining `entityId` from
        // handle is done by performing a bit mask for the lower 11 bits. Thus the values
        // of `weaponId` will be different depending on the game:
        // TF2 - entity handle
        // HL2DM - entity id
        if (this.match.outerMap.size > 0) {
            return this.weaponIds
                .map((id) => this.match.outerMap.get(id))
                .filter((entityId) => entityId > 0)
                .map((entityId) => (Object.assign({ entityId }, this.match.weaponMap.get(entityId))));
        }
        else {
            return this.weaponIds
                .map((id) => {
                const weapon = this.match.weaponMap.get(id);
                return weapon ? Object.assign({}, weapon, { entityId: id }) : undefined;
            })
                .filter((weapon) => weapon !== undefined);
        }
    }
}
exports.Player = Player;
//# sourceMappingURL=Player.js.map