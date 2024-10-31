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
            // `weaponMap` is not guaranteed to be stable, and `entity.entityIndex` might end
            // up being reused to reference a different weapon (likely due to some entity pooling
            // mechanism) - so we need to update this mapping any time there are changes. Note: this
            // means `weaponMap` is not safe to use as a lookup mapping!
            const existingEntry = match.weaponMap.get(entity.entityIndex);
            if (!existingEntry || existingEntry.className !== entity.serverClass.name) {
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