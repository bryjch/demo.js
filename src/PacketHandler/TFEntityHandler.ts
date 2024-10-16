import { Building, Dispenser, Sentry, Teleporter } from "../Data/Building";
import { Match } from "../Data/Match";
import { PacketMessage } from "../Data/Message";
import { PacketEntity, PVS } from "../Data/PacketEntity";
import { Player } from "../Data/Player";
import { Projectile, ProjectileServerClassMap } from "../Data/Projectile";
import { SendProp } from "../Data/SendProp";
import { TeamNumber } from "../Data/Team";
import { Vector } from "../Data/Vector";
import { CWeaponMedigun } from "../Data/Weapon";

export function handleTFEntity(
  entity: PacketEntity,
  match: Match,
  message: PacketMessage
) {
  switch (entity.serverClass.name) {
    case "CTFPlayer":
      /**
       * "DT_TFPlayerScoringDataExclusive.m_iCaptures": 0,
       * "DT_TFPlayerScoringDataExclusive.m_iDefenses": 0,
       * "DT_TFPlayerScoringDataExclusive.m_iKills": 5,
       * "DT_TFPlayerScoringDataExclusive.m_iDeaths": 17,
       * "DT_TFPlayerScoringDataExclusive.m_iSuicides": 7,
       * "DT_TFPlayerScoringDataExclusive.m_iDominations": 0,
       * "DT_TFPlayerScoringDataExclusive.m_iRevenge": 0,
       * "DT_TFPlayerScoringDataExclusive.m_iBuildingsBuilt": 0,
       * "DT_TFPlayerScoringDataExclusive.m_iBuildingsDestroyed": 0,
       * "DT_TFPlayerScoringDataExclusive.m_iHeadshots": 0,
       * "DT_TFPlayerScoringDataExclusive.m_iBackstabs": 0,
       * "DT_TFPlayerScoringDataExclusive.m_iHealPoints": 0,
       * "DT_TFPlayerScoringDataExclusive.m_iInvulns": 0,
       * "DT_TFPlayerScoringDataExclusive.m_iTeleports": 0,
       * "DT_TFPlayerScoringDataExclusive.m_iDamageDone": 847,
       * "DT_TFPlayerScoringDataExclusive.m_iCrits": 0,
       * "DT_TFPlayerScoringDataExclusive.m_iResupplyPoints": 0,
       * "DT_TFPlayerScoringDataExclusive.m_iKillAssists": 0,
       * "DT_TFPlayerScoringDataExclusive.m_iBonusPoints": 0,
       * "DT_TFPlayerScoringDataExclusive.m_iPoints": 6,
       * "DT_TFPlayerSharedLocal.m_nDesiredDisguiseTeam": 0,
       * "DT_TFPlayerSharedLocal.m_nDesiredDisguiseClass": 0,
       * "DT_TFPlayerShared.m_iKillStreak": 0,
       * "DT_TFPlayerShared.m_flCloakMeter": 100,
       */

      const userInfo = match.getUserInfoForEntity(entity);

      if (!userInfo) {
        throw new Error(`No user info for entity ${entity.entityIndex}`);
      }

      const player: Player = match.playerEntityMap.has(entity.entityIndex)
        ? (match.playerEntityMap.get(entity.entityIndex) as Player)
        : new Player(match, userInfo);

      if (!match.playerEntityMap.has(entity.entityIndex)) {
        match.playerEntityMap.set(entity.entityIndex, player);
      }

      for (const prop of entity.props) {
        if (prop.definition.ownerTableName === "m_hMyWeapons") {
          if (prop.value !== 2097151) {
            player.weaponIds[
              parseInt(prop.definition.name, 10)
            ] = prop.value as number;
          }
        }
        if (prop.definition.ownerTableName === "m_iAmmo") {
          if (prop.value !== null && (prop.value as number) > 0) {
            player.ammo[
              parseInt(prop.definition.name, 10)
            ] = prop.value as number;
          }
        }
        const propName =
          prop.definition.ownerTableName + "." + prop.definition.name;
        switch (propName) {
          case "DT_BasePlayer.m_iHealth":
            player.health = prop.value as number;
            break;
          case "DT_BasePlayer.m_iMaxHealth":
            player.maxHealth = prop.value as number;
            break;
          case "DT_TFLocalPlayerExclusive.m_vecOrigin":
            player.position.x = (prop.value as Vector).x;
            player.position.y = (prop.value as Vector).y;

            // set the view angles for the local player since that prop isn't send
            player.viewAngle = message.localViewAngles[0].y;
            player.viewAngles.x = message.localViewAngles[0].x;
            player.viewAngles.y = message.localViewAngles[0].y;
            player.viewAngles.z = message.localViewAngles[0].z;
            break;
          case "DT_TFNonLocalPlayerExclusive.m_vecOrigin":
            player.position.x = (prop.value as Vector).x;
            player.position.y = (prop.value as Vector).y;
            break;
          case "DT_TFLocalPlayerExclusive.m_vecOrigin[2]":
            player.position.z = prop.value as number;
            break;
          case "DT_TFNonLocalPlayerExclusive.m_vecOrigin[2]":
            player.position.z = prop.value as number;
            break;
          case "DT_TFNonLocalPlayerExclusive.m_angEyeAngles[0]":
            player.viewAngles.y = prop.value as number;
            break;
          case "DT_TFNonLocalPlayerExclusive.m_angEyeAngles[1]":
            player.viewAngle = prop.value as number;
            player.viewAngles.x = prop.value as number;
            break;
          case "DT_TFLocalPlayerExclusive.m_angEyeAngles[0]":
            player.viewAngles.y = prop.value as number;
            break;
          case "DT_TFLocalPlayerExclusive.m_angEyeAngles[1]":
            player.viewAngle = prop.value as number;
            player.viewAngles.x = prop.value as number;
            break;
          case "DT_BasePlayer.m_lifeState":
            player.lifeState = prop.value as number;
            break;
          case "DT_BaseCombatCharacter.m_hActiveWeapon":
            for (let i = 0; i < player.weapons.length; i++) {
              if (player.weaponIds[i] === prop.value) {
                player.activeWeapon = i;
              }
            }
        }
      }
      break;
    case "CWeaponMedigun":
      const weapon = match.weaponMap.get(entity.entityIndex) as
        | CWeaponMedigun
        | undefined;
      if (weapon && weapon.className === "CWeaponMedigun") {
        for (const prop of entity.props) {
          const propName =
            prop.definition.ownerTableName + "." + prop.definition.name;

          switch (propName) {
            case "DT_WeaponMedigun.m_hHealingTarget":
              // prop.value is the entityId of the attribute manager - which is rather useless
              // to figure out which entity (player) that is being healed, so we convert it
              // to the entityId of the player instead
              weapon.healTarget = match.outerMap.get(
                prop.value as number
              ) as number;
              break;
            case "DT_TFWeaponMedigunDataNonLocal.m_flChargeLevel":
              weapon.chargeLevel = prop.value as number;
              break;
            case "DT_LocalTFWeaponMedigunData.m_flChargeLevel":
              weapon.chargeLevel = prop.value as number;
              break;
          }
        }
      }
      break;
    case "CTFTeam":
      if (entity.hasProperty("DT_Team", "m_iTeamNum")) {
        const teamId = entity.getProperty("DT_Team", "m_iTeamNum")
          .value as TeamNumber;
        if (!match.teams.has(teamId)) {
          const team = {
            name: entity.getProperty("DT_Team", "m_szTeamname").value as string,
            score: entity.getProperty("DT_Team", "m_iScore").value as number,
            roundsWon: entity.getProperty("DT_Team", "m_iRoundsWon")
              .value as number,
            players: entity.getProperty("DT_Team", '"player_array"')
              .value as number[],
            teamNumber: teamId,
          };
          match.teams.set(teamId, team);
          match.teamEntityMap.set(entity.entityIndex, team);
        }
      } else {
        const team = match.teamEntityMap.get(entity.entityIndex);
        if (!team) {
          throw new Error(`No team with entity id: ${entity.entityIndex}`);
        }
        for (const prop of entity.props) {
          const propName =
            prop.definition.ownerTableName + "." + prop.definition.name;
          switch (propName) {
            case "DT_Team.m_iScore":
              team.score = prop.value as number;
              break;
            case "DT_Team.m_szTeamname":
              team.name = prop.value as string;
              break;
            case "DT_Team.m_iRoundsWon":
              team.roundsWon = prop.value as number;
              break;
            case 'DT_Team."player_array"':
              team.players = prop.value as number[];
              break;
          }
        }
      }
      break;
    case "CObjectSentrygun":
      if (!match.buildings.has(entity.entityIndex)) {
        match.buildings.set(entity.entityIndex, {
          type: "sentry",
          ammoRockets: 0,
          ammoShells: 0,
          autoAimTarget: 0,
          builder: 0,
          health: 0,
          isBuilding: false,
          isSapped: false,
          level: 0,
          maxHealth: 0,
          playerControlled: false,
          position: new Vector(0, 0, 0),
          shieldLevel: 0,
          isMini: false,
          team: 0,
          angle: 0,
        });
      }
      const sentry = match.buildings.get(entity.entityIndex) as Sentry;
      for (const prop of entity.props) {
        const propName =
          prop.definition.ownerTableName + "." + prop.definition.name;
        applyBuildingProp(sentry, prop, propName);
        switch (propName) {
          case "DT_ObjectSentrygun.m_bPlayerControlled":
            sentry.playerControlled = (prop.value as number) > 0;
            break;
          case "DT_ObjectSentrygun.m_hAutoAimTarget":
            sentry.autoAimTarget = prop.value as number;
            break;
          case "DT_ObjectSentrygun.m_nShieldLevel":
            sentry.shieldLevel = prop.value as number;
            break;
          case "DT_ObjectSentrygun.m_iAmmoShells":
            sentry.ammoShells = prop.value as number;
            break;
          case "DT_ObjectSentrygun.m_iAmmoRockets":
            sentry.ammoRockets = prop.value as number;
            break;
          case "DT_BaseObject.m_bMiniBuilding":
            sentry.isMini = (prop.value as number) > 1;
            break;
          case "DT_TFNonLocalPlayerExclusive.m_angEyeAngles[1]":
            sentry.angle = prop.value as number;
            break;
        }
      }
      if (entity.pvs & PVS.LEAVE) {
        match.buildings.delete(entity.entityIndex);
      }
      break;
    case "CObjectDispenser":
      if (!match.buildings.has(entity.entityIndex)) {
        match.buildings.set(entity.entityIndex, {
          type: "dispenser",
          builder: 0,
          health: 0,
          isBuilding: false,
          isSapped: false,
          level: 0,
          maxHealth: 0,
          position: new Vector(0, 0, 0),
          team: 0,
          healing: [],
          metal: 0,
          angle: 0,
        });
      }
      const dispenser = match.buildings.get(entity.entityIndex) as Dispenser;
      for (const prop of entity.props) {
        const propName =
          prop.definition.ownerTableName + "." + prop.definition.name;
        applyBuildingProp(dispenser, prop, propName);
        switch (propName) {
          case "DT_ObjectDispenser.m_iAmmoMetal":
            dispenser.metal = prop.value as number;
            break;
          case 'DT_ObjectDispenser."healing_array"':
            dispenser.healing = prop.value as number[];
            break;
        }
      }
      if (entity.pvs & PVS.LEAVE) {
        match.buildings.delete(entity.entityIndex);
      }
      break;
    case "CObjectTeleporter":
      if (!match.buildings.has(entity.entityIndex)) {
        match.buildings.set(entity.entityIndex, {
          type: "teleporter",
          builder: 0,
          health: 0,
          isBuilding: false,
          isSapped: false,
          level: 0,
          maxHealth: 0,
          position: new Vector(0, 0, 0),
          team: 0,
          isEntrance: false,
          otherEnd: 0,
          rechargeTime: 0,
          rechargeDuration: 0,
          timesUsed: 0,
          angle: 0,
          yawToExit: 0,
        });
      }
      const teleporter = match.buildings.get(entity.entityIndex) as Teleporter;
      for (const prop of entity.props) {
        const propName =
          prop.definition.ownerTableName + "." + prop.definition.name;
        applyBuildingProp(teleporter, prop, propName);
        switch (propName) {
          case "DT_ObjectTeleporter.m_flRechargeTime":
            teleporter.rechargeTime = prop.value as number;
            break;
          case "DT_ObjectTeleporter.m_flCurrentRechargeDuration":
            teleporter.rechargeDuration = prop.value as number;
            break;
          case "DT_ObjectTeleporter.m_iTimesUsed":
            teleporter.timesUsed = prop.value as number;
            break;
          case "DT_ObjectTeleporter.m_bMatchBuilding":
            teleporter.otherEnd = prop.value as number;
            break;
          case "DT_ObjectTeleporter.m_flYawToExit":
            teleporter.yawToExit = prop.value as number;
            break;
          case "DT_BaseObject.m_iObjectMode":
            teleporter.isEntrance = (prop.value as number) === 0;
            break;
        }
      }
      if (entity.pvs & PVS.LEAVE) {
        match.buildings.delete(entity.entityIndex);
      }
      break;
    case "CTFPlayerResource":
      for (const prop of entity.props) {
        const playerId = parseInt(prop.definition.name, 10);
        const value = prop.value as number;
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
    case "CTeamRoundTimer":
      break;
    case "CLaserDot":
      // for (const prop of entity.props) {
      // 	const propName = prop.definition.ownerTableName + '.' + prop.definition.name;
      // 	switch (propName) {
      // 		case 'DT_BaseEntity.m_iParentAttachment':
      // 			console.log(prop.value);
      // 			process.exit();
      // 			break;
      //
      // 	}
      // }
      // console.log(match.getSendTable(entity.serverClass.dataTable).flattenedProps);

      break;

    case "CTFGrenadePipebombProjectile":
    case "CTFProjectile_HealingBolt":
    case "CTFProjectile_Rocket":
      let projectileType = ProjectileServerClassMap[entity.serverClass.name];
      if (!projectileType) break;

      if (!match.projectileEntityMap.has(entity.entityIndex)) {
        match.projectileEntityMap.set(entity.entityIndex, {
          type: projectileType,
          position: new Vector(0, 0, 0),
          rotation: new Vector(0, 0, 0),
          teamNumber: 0,
        });
      }

      const projectile = match.projectileEntityMap.get(
        entity.entityIndex
      ) as Projectile;

      for (const prop of entity.props) {
        switch (prop.definition.name) {
          case "m_vecOrigin":
            projectile.position = prop.value as Vector;
            break;
          case "m_angRotation":
            projectile.rotation = prop.value as Vector;
            break;
          case "m_iTeamNum":
            projectile.teamNumber = prop.value as number;
            break;
          case "m_iType":
            projectile.type = projectile.type + (prop.value as number);
            break;

          case "m_hOwnerEntity":
          case "m_bCritical":
          case "m_bTouched":
            // Maybe do something
            break;
        }
      }

      if (entity.pvs & PVS.LEAVE) {
        match.projectileEntityMap.delete(entity.entityIndex);
      }

      break;
  }
}

function applyBuildingProp(
  building: Building,
  prop: SendProp,
  propName: string
) {
  switch (propName) {
    case "DT_BaseObject.m_iUpgradeLevel":
      building.level = prop.value as number;
      break;
    case "DT_BaseObject.m_hBuilder":
      building.builder = prop.value as number;
      break;
    case "DT_BaseObject.m_iMaxHealth":
      building.maxHealth = prop.value as number;
      break;
    case "DT_BaseObject.m_iHealth":
      building.health = prop.value as number;
      break;
    case "DT_BaseObject.m_bBuilding":
      building.isBuilding = (prop.value as number) > 0;
      break;
    case "DT_BaseObject.m_bHasSapper":
      building.isSapped = (prop.value as number) > 0;
      break;
    case "DT_BaseEntity.m_vecOrigin":
      building.position = prop.value as Vector;
      break;
    case "DT_BaseEntity.m_iTeamNum":
      building.team = prop.value as number;
      break;
    case "DT_BaseEntity.m_angRotation":
      building.angle = (prop.value as Vector).y;
      break;
  }
}
