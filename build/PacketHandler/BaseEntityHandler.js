"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// const tables = {}
function handleBaseEntity(entity, match, message) {
    for (const prop of entity.props) {
        // if (!tables[prop.definition.ownerTableName]) {
        // 	tables[prop.definition.ownerTableName] = true
        // }
        if (prop.definition.ownerTableName === 'DT_AttributeContainer' && prop.definition.name === 'm_hOuter') {
            if (!match.outerMap.has(prop.value)) {
                match.outerMap.set(prop.value, entity.entityIndex);
            }
        }
        if (prop.definition.ownerTableName === 'DT_AttributeManager' && prop.definition.name === 'm_hOuter') {
            if (!match.outerMap.has(prop.value)) {
                match.outerMap.set(prop.value, entity.entityIndex);
            }
        }
        if (prop.definition.ownerTableName === 'DT_BaseCombatWeapon' && prop.definition.name === 'm_hOwner') {
            if (!match.weaponMap.has(entity.entityIndex)) {
                match.weaponMap.set(entity.entityIndex, {
                    className: entity.serverClass.name,
                    owner: prop.value
                });
            }
        }
    }
    switch (entity.serverClass.name) {
        case 'CWorld':
            match.world.boundaryMin = entity.getProperty('DT_WORLD', 'm_WorldMins').value;
            match.world.boundaryMax = entity.getProperty('DT_WORLD', 'm_WorldMaxs').value;
            break;
    }
}
exports.handleBaseEntity = handleBaseEntity;
//# sourceMappingURL=BaseEntityHandler.js.map