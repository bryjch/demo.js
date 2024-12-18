"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PacketEntity_1 = require("../Data/PacketEntity");
const Player_1 = require("../Data/Player");
const Vector_1 = require("../Data/Vector");
const Weapon_1 = require("../Data/Weapon");
// // Uncomment for debugging
// const serverClasses = {}
function handleHL2DMEntity(entity, match, message) {
    // serverClasses[entity.serverClass.name] = (serverClasses[entity.serverClass.name] || 0) + 1;
    // console.log(serverClasses);
    switch (entity.serverClass.name) {
        case "CHL2MP_Player":
            const userInfo = match.getUserInfoForEntity(entity);
            if (!userInfo) {
                throw new Error(`No user info for entity ${entity.entityIndex}`);
            }
            if (userInfo.entityId !== entity.entityIndex) {
                throw new Error(`Invalid user info for entity ${entity.entityIndex} vs ${userInfo.entityId}`);
            }
            const player = match.playerEntityMap.has(entity.entityIndex) ? match.playerEntityMap.get(entity.entityIndex) : new Player_1.Player(match, userInfo);
            if (!match.playerEntityMap.has(entity.entityIndex)) {
                match.playerEntityMap.set(entity.entityIndex, player);
            }
            for (const prop of entity.props) {
                if (prop.definition.ownerTableName === "m_hMyWeapons") {
                    if (prop.value !== 2097151) {
                        player.weaponIds[parseInt(prop.definition.name, 10)] = extractEntityId(prop.value);
                    }
                }
                if (prop.definition.ownerTableName === "m_iAmmo") {
                    if (prop.value !== null && prop.value > 0) {
                        player.ammo[parseInt(prop.definition.name, 10)] = prop.value;
                    }
                }
                const propName = prop.definition.ownerTableName + "." + prop.definition.name;
                switch (propName) {
                    case "DT_BaseEntity.m_iTeamNum":
                        if (!player.user.team && (prop.value === 2 || prop.value === 3)) {
                            player.user.team = prop.value === 2 ? "red" : "blue";
                        }
                        player.team = prop.value;
                        break;
                    case "DT_BasePlayer.m_iHealth":
                        player.health = prop.value;
                        break;
                    case "DT_BasePlayer.m_iMaxHealth":
                        player.maxHealth = prop.value;
                        break;
                    case "DT_BaseEntity.m_vecOrigin":
                        player.position.x = prop.value.x;
                        player.position.y = prop.value.y;
                        player.position.z = prop.value.z;
                        break;
                    case "DT_HL2MP_Player.m_angEyeAngles[0]":
                        player.viewAngle = prop.value;
                        player.viewAngles.y = prop.value;
                        break;
                    case "DT_HL2MP_Player.m_angEyeAngles[1]":
                        player.viewAngle = prop.value;
                        player.viewAngles.x = prop.value;
                        break;
                    case "DT_BasePlayer.m_lifeState":
                        player.lifeState = prop.value;
                        break;
                    case "DT_BaseCombatCharacter.m_hActiveWeapon":
                        const weaponId = extractEntityId(prop.value);
                        const weapon = match.weaponMap.get(weaponId);
                        if (weapon) {
                            const weaponId = Weapon_1.WeaponClassNameToIdMap[weapon.className];
                            player.activeWeapon = weaponId || 0;
                        }
                        break;
                    case "DT_BaseFlex.m_vecViewOffset[2]":
                        // vertical offset equivalent to player crouching. since
                        // we aren't using `viewAngles.z` for anything, we can
                        // save from creating another cache to store this info
                        player.viewAngles.z = prop.value;
                        break;
                    default:
                    // uncomment to see available props
                    // console.log(propName);
                }
            }
            break;
        case "CTeam":
            if (entity.hasProperty("DT_Team", "m_iTeamNum")) {
                const teamId = entity.getProperty("DT_Team", "m_iTeamNum").value;
                if (!match.teams.has(teamId)) {
                    const team = {
                        name: entity.getProperty("DT_Team", "m_szTeamname").value,
                        score: entity.getProperty("DT_Team", "m_iScore").value,
                        roundsWon: entity.getProperty("DT_Team", "m_iRoundsWon").value,
                        players: entity.getProperty("DT_Team", '"player_array"').value,
                        teamNumber: teamId,
                    };
                    match.teams.set(teamId, team);
                    match.teamEntityMap.set(entity.entityIndex, team);
                }
            }
            else {
                const team = match.teamEntityMap.get(entity.entityIndex);
                if (!team) {
                    throw new Error(`No team with entity id: ${entity.entityIndex}`);
                }
                for (const prop of entity.props) {
                    const propName = prop.definition.ownerTableName + "." + prop.definition.name;
                    switch (propName) {
                        case "DT_Team.m_iScore":
                            team.score = prop.value;
                            break;
                        case "DT_Team.m_szTeamname":
                            team.name = prop.value;
                            break;
                        case "DT_Team.m_iRoundsWon":
                            team.roundsWon = prop.value;
                            break;
                        case 'DT_Team."player_array"':
                            team.players = prop.value;
                            break;
                    }
                }
            }
            break;
        case "CPlayerResource":
            for (const prop of entity.props) {
                const playerId = parseInt(prop.definition.name, 10);
                const value = prop.value;
                if (!match.playerResources[playerId]) {
                    match.playerResources[playerId] = {
                        alive: false,
                        arenaSpectator: false,
                        bonusPoints: 0,
                        chargeLevel: 0,
                        connected: false,
                        damageAssists: 0,
                        damageBlocked: 0,
                        deaths: 0,
                        dominations: 0,
                        healing: 0,
                        healingAssist: 0,
                        health: 0,
                        killStreak: 0,
                        maxBuffedHealth: 0,
                        maxHealth: 0,
                        nextRespawn: 0,
                        ping: 0,
                        playerClass: 0,
                        playerLevel: 0,
                        score: 0,
                        team: 0,
                        totalScore: 0,
                        damage: 0,
                    };
                }
                const playerResource = match.playerResources[playerId];
                switch (prop.definition.ownerTableName) {
                    case "m_iPing":
                        playerResource.ping = value;
                        break;
                    case "m_iScore":
                        playerResource.score = value;
                        break;
                    case "m_iDeaths":
                        playerResource.deaths = value;
                        break;
                    case "m_bConnected":
                        playerResource.connected = value > 0;
                        break;
                    case "m_iTeam":
                        playerResource.team = value;
                        break;
                    case "m_bAlive":
                        playerResource.alive = value > 0;
                        break;
                    case "m_iHealth":
                        playerResource.health = value;
                        break;
                    case "m_iTotalScore":
                        playerResource.totalScore = value;
                        break;
                    case "m_iMaxHealth":
                        playerResource.maxHealth = value;
                        break;
                    case "m_iMaxBuffedHealth":
                        playerResource.maxBuffedHealth = value;
                        break;
                    case "m_iPlayerClass":
                        playerResource.playerClass = value;
                        break;
                    case "m_bArenaSpectator":
                        playerResource.arenaSpectator = value > 0;
                        break;
                    case "m_iActiveDominations":
                        playerResource.dominations = value;
                        break;
                    case "m_flNextRespawnTime":
                        playerResource.nextRespawn = value;
                        break;
                    case "m_iChargeLevel":
                        playerResource.chargeLevel = value;
                        break;
                    case "m_iDamage":
                        playerResource.damage = value;
                        break;
                    case "m_iDamageAssist":
                        playerResource.damageAssists = value;
                        break;
                    case "m_iHealing":
                        playerResource.healing = value;
                        break;
                    case "m_iHealingAssist":
                        playerResource.healingAssist = value;
                        break;
                    case "m_iDamageBlocked":
                        playerResource.damageBlocked = value;
                        break;
                    case "m_iBonusPoints":
                        playerResource.bonusPoints = value;
                        break;
                    case "m_iPlayerLevel":
                        playerResource.playerLevel = value;
                        break;
                    case "m_iKillstreak":
                        playerResource.killStreak = value;
                        break;
                }
            }
            break;
        // https://developer.valvesoftware.com/wiki/CBaseAnimating
        case "CBaseAnimating":
        case "CPropCombineBall":
        case "CPhysicsProp":
        case "CWeaponSMG1":
        case "CWeaponFrag":
        case "CWeaponPistol":
        case "CWeaponShotgun":
        case "CWeaponCrossbow":
            // case "CPhysicsPropMultiplayer": // might not be necessary
            if (!match.spawnItemEntityMap.has(entity.entityIndex)) {
                match.spawnItemEntityMap.set(entity.entityIndex, {
                    position: new Vector_1.Vector(0, 0, 0),
                    rotation: new Vector_1.Vector(0, 0, 0),
                    modelName: "",
                });
            }
            const spawnItem = match.spawnItemEntityMap.get(entity.entityIndex);
            for (const prop of entity.props) {
                switch (prop.definition.name) {
                    case "m_vecOrigin":
                        spawnItem.position = prop.value;
                        break;
                    case "m_angRotation":
                        spawnItem.rotation = prop.value;
                        break;
                    case "m_nModelIndex":
                        const modelName = match.parserState.modelPrecache.get(prop.value);
                        if (modelName)
                            spawnItem.modelName = modelName;
                        break;
                    default:
                        // console.log(prop.definition.name);
                        break;
                }
            }
            if (entity.pvs & PacketEntity_1.PVS.LEAVE) {
                match.spawnItemEntityMap.delete(entity.entityIndex);
            }
            break;
    }
}
exports.handleHL2DMEntity = handleHL2DMEntity;
/**
 * TF2 has `DT_AttributeContainer`, `DT_AttributeManager` and `m_hOuter` values that can be
 * used to determine an entity's ID from the "outer ID" - HL2DM does not have these entity packets.
 * However it seems we can extract the entity by doing performing a bit mask for the lower 11 bits.
 */
function extractEntityId(entityHandleId) {
    return entityHandleId & 0x7ff;
}
//# sourceMappingURL=HL2DMEntityHandler.js.map