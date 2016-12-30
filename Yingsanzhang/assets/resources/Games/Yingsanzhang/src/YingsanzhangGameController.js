var constDef = require("ConstDef");
var gameConstDef = require("YingsanzhangConstDef");
var ProtocolMessage = require("ProtocolMessage");
var HintManager = require("HintManager");
var GlobalManager = require("GlobalManager");
var GameMessage = require("YingsanzhangGameMessage");

cc.Class({
    extends: cc.Component,

    properties: {
        gameData: require("YingsanzhangGameData"),

    },
    onLoad: function () {

    },
    gameRegisterMessage:function()
    {
         GlobalManager.instance.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_PLATFORM, constDef.MESSAGE.ENTER_ROOM_SUCCESS, GameMessage.handler_ENTER_ROOM_SUCCESS);
         GlobalManager.instance.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_PLATFORM, constDef.MESSAGE.ENTER_ROOM_FAILED, GameMessage.handler_ENTER_ROOM_FAILED);
         
         GlobalManager.instance.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_PLATFORM, constDef.MESSAGE.PLAYER_ENTER_ROOM_NOTIFY, GameMessage.handler_PLAYER_ENTER_ROOM_NOTIFY);
         GlobalManager.instance.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_PLATFORM, constDef.MESSAGE.PLAYER_LEAVE_ROOM_NOTIFY, GameMessage.handler_PLAYER_LEAVE_ROOM_NOTIFY);
         
         GlobalManager.instance.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_PLATFORM, constDef.MESSAGE.GET_GAME_INFO_SUCCESS, GameMessage.handler_GET_GAME_INFO_SUCCESS);
         GlobalManager.instance.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_PLATFORM, constDef.MESSAGE.GET_GAME_INFO_FAILED, GameMessage.handler_GET_GAME_INFO_FAILED);
         
         GlobalManager.instance.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_PLATFORM, constDef.MESSAGE.GET_PLAYERS_BASE_INFO_SUCCESS, GameMessage.handler_GET_PLAYERS_BASE_INFO_SUCCESS);
         GlobalManager.instance.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_PLATFORM, constDef.MESSAGE.GET_PLAYERS_BASE_INFO_FAILED, GameMessage.handler_GET_PLAYERS_BASE_INFO_FAILED);
         
         GlobalManager.instance.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_PLATFORM, constDef.MESSAGE.BALANCE_NOTIFY, GameMessage.handler_BALANCE_NOTIFY);

         GlobalManager.instance.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_GAME, constDef.MESSAGE.LEAVE_TEAM_NOTIFY, GameMessage.handler_LEAVE_TEAM_NOTIFY);
         GlobalManager.instance.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_GAME, constDef.MESSAGE.TEAM_ALL_READY_NOTIFY, GameMessage.handler_TEAM_ALL_READY_NOTIFY);
         GlobalManager.instance.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_GAME, constDef.MESSAGE.TEAM_ALL_READY_SUCCESS, GameMessage.handler_TEAM_ALL_READY_SUCCESS);
         GlobalManager.instance.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_GAME, constDef.MESSAGE.TEAM_ALL_READY_FAILED, GameMessage.handler_TEAM_ALL_READY_FAILED);
         GlobalManager.instance.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_GAME, constDef.MESSAGE.ENTER_BATTLE_NOTIFY, GameMessage.handler_ENTER_BATTLE_NOTIFY);
         GlobalManager.instance.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_GAME, constDef.MESSAGE.ENTER_BATTLE_SUCCESS, GameMessage.handler_ENTER_BATTLE_SUCCESS);
         GlobalManager.instance.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_GAME, constDef.MESSAGE.ENTER_BATTLE_FAILED, GameMessage.handler_ENTER_BATTLE_FAILED);
         GlobalManager.instance.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_GAME, constDef.MESSAGE.FIGHT_READY_SUCCESS, GameMessage.handler_FIGHT_READY_SUCCESS);
         GlobalManager.instance.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_GAME, constDef.MESSAGE.FIGHT_READY_FAILED, GameMessage.handler_FIGHT_READY_FAILED); 
         GlobalManager.instance.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_GAME, constDef.MESSAGE.FIGHT_READY_NOTIFY, GameMessage.handler_FIGHT_READY_NOTIFY); 
         GlobalManager.instance.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_GAME, constDef.MESSAGE.SCENE_READY_NOTIFY, GameMessage.handler_SCENE_READY_NOTIFY);
         GlobalManager.instance.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_GAME, constDef.MESSAGE.SCENE_READY_SUCCESS, GameMessage.handler_SCENE_READY_SUCCESS);
         GlobalManager.instance.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_GAME, constDef.MESSAGE.SCENE_READY_FAILED, GameMessage.handler_SCENE_READY_FAILED);         
         GlobalManager.instance.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_GAME, constDef.MESSAGE.FIGHT_BEGIN_NOTIFY, GameMessage.handler_FIGHT_BEGIN_NOTIFY);
         GlobalManager.instance.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_GAME, constDef.MESSAGE.FIGHT_END_NOTIFY, GameMessage.handler_FIGHT_END_NOTIFY);
         GlobalManager.instance.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_GAME, constDef.MESSAGE.GET_TEAM_MEMBERS_SUCCESS, GameMessage.handler_GET_TEAM_MEMBERS_SUCCESS);
         GlobalManager.instance.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_GAME, constDef.MESSAGE.GET_TEAM_MEMBERS_FAILED, GameMessage.handler_GET_TEAM_MEMBERS_FAILED);  
         GlobalManager.instance.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_GAME, constDef.MESSAGE.GET_MATCH_DATA_NOTIFY, GameMessage.handler_GET_MATCH_DATA_NOTIFY);
         GlobalManager.instance.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_GAME, constDef.MESSAGE.GET_MATCH_CUR_COUNT_SUCCESS, GameMessage.handler_GET_MATCH_CUR_COUNT_SUCCESS);
         GlobalManager.instance.RegMsgHandler(constDef.MESSAGE.CMD_MAIN_GAME, constDef.MESSAGE.GET_MATCH_CUR_COUNT_FAILED, GameMessage.handler_GET_MATCH_CUR_COUNT_FAILED);
    
         GlobalManager.instance.RegMsgHandler(gameConstDef.MESSAGE.CMD_MAIN_YingSanZhang, gameConstDef.MESSAGE.BET_SUCCESS, GameMessage.handler_BET_SUCCESS);
         GlobalManager.instance.RegMsgHandler(gameConstDef.MESSAGE.CMD_MAIN_YingSanZhang, gameConstDef.MESSAGE.BET_FAILED, GameMessage.handler_BET_FAILED);
         GlobalManager.instance.RegMsgHandler(gameConstDef.MESSAGE.CMD_MAIN_YingSanZhang, gameConstDef.MESSAGE.BET_NOTIFY, GameMessage.handler_BET_NOTIFY);
         
         GlobalManager.instance.RegMsgHandler(gameConstDef.MESSAGE.CMD_MAIN_YingSanZhang, gameConstDef.MESSAGE.FOLLOW_BET_SUCCESS, GameMessage.handler_FOLLOW_BET_SUCCESS);
         GlobalManager.instance.RegMsgHandler(gameConstDef.MESSAGE.CMD_MAIN_YingSanZhang, gameConstDef.MESSAGE.FOLLOW_BET_NOTIFY, GameMessage.handler_FOLLOW_BET_NOTIFY);
         GlobalManager.instance.RegMsgHandler(gameConstDef.MESSAGE.CMD_MAIN_YingSanZhang, gameConstDef.MESSAGE.FOLLOW_BET_FAILED, GameMessage.handler_FOLLOW_BET_FAILED);

         GlobalManager.instance.RegMsgHandler(gameConstDef.MESSAGE.CMD_MAIN_YingSanZhang, gameConstDef.MESSAGE.ADD_BET_SUCCESS, GameMessage.handler_ADD_BET_SUCCESS);
         GlobalManager.instance.RegMsgHandler(gameConstDef.MESSAGE.CMD_MAIN_YingSanZhang, gameConstDef.MESSAGE.ADD_BET_FAILED, GameMessage.handler_ADD_BET_FAILED);
         GlobalManager.instance.RegMsgHandler(gameConstDef.MESSAGE.CMD_MAIN_YingSanZhang, gameConstDef.MESSAGE.ADD_BET_NOTIFY, GameMessage.handler_ADD_BET_NOTIFY);

         GlobalManager.instance.RegMsgHandler(gameConstDef.MESSAGE.CMD_MAIN_YingSanZhang, gameConstDef.MESSAGE.LOOK_CARD_SUCCESS, GameMessage.handler_LOOK_CARD_SUCCESS);
         GlobalManager.instance.RegMsgHandler(gameConstDef.MESSAGE.CMD_MAIN_YingSanZhang, gameConstDef.MESSAGE.LOOK_CARD_NOTIFY, GameMessage.handler_LOOK_CARD_NOTIFY);
         GlobalManager.instance.RegMsgHandler(gameConstDef.MESSAGE.CMD_MAIN_YingSanZhang, gameConstDef.MESSAGE.LOOK_CARD_FAILED, GameMessage.handler_LOOK_CARD_FAILED);

         GlobalManager.instance.RegMsgHandler(gameConstDef.MESSAGE.CMD_MAIN_YingSanZhang, gameConstDef.MESSAGE.DISCARD_SUCCESS, GameMessage.handler_DISCARD_SUCCESS);
         GlobalManager.instance.RegMsgHandler(gameConstDef.MESSAGE.CMD_MAIN_YingSanZhang, gameConstDef.MESSAGE.DISCARD_FAILED, GameMessage.handler_DISCARD_FAILED);
         GlobalManager.instance.RegMsgHandler(gameConstDef.MESSAGE.CMD_MAIN_YingSanZhang, gameConstDef.MESSAGE.DISCARD_NOTIFY, GameMessage.handler_DISCARD_NOTIFY);

         GlobalManager.instance.RegMsgHandler(gameConstDef.MESSAGE.CMD_MAIN_YingSanZhang, gameConstDef.MESSAGE.COMPARE_CARD_SUCCESS, GameMessage.handler_COMPARE_CARD_SUCCESS);
         GlobalManager.instance.RegMsgHandler(gameConstDef.MESSAGE.CMD_MAIN_YingSanZhang, gameConstDef.MESSAGE.COMPARE_CARD_FAILED, GameMessage.handler_COMPARE_CARD_FAILED);
         GlobalManager.instance.RegMsgHandler(gameConstDef.MESSAGE.CMD_MAIN_YingSanZhang, gameConstDef.MESSAGE.COMPARE_CARD_NOTIFY, GameMessage.handler_COMPARE_CARD_NOTIFY);
         
    },

     RefreshPlayerData: function(type)
     {
         cc.log("type",type);
     },
     SendMsg:function(status)
    { 
        var gameData = GlobalManager.instance.GetGameData(GlobalManager.instance.selfData.nCurGameID);
        switch (status)
        {
            case constDef.CONNECT_CALLBACK_STATUS.LOGON_GET_GAME_INFO:
            {
                let msg = new ProtocolMessage(constDef.MESSAGE.CMD_MAIN_PLATFORM,constDef.MESSAGE.GET_GAME_INFO_REQ,false); 
                ProtocolMessage.AddVectItemInt(msg._body_msg, GlobalManager.instance.selfData.nAccountID);
                ProtocolMessage.AddVectItemInt(msg._body_msg, GlobalManager.instance.selfData.nCurGameID);
                ProtocolMessage.AddVectItemInt(msg._body_msg, 0);
                ProtocolMessage.AddVectItemInt(msg._body_msg, 0);
                GlobalManager.instance.SendLogonMsg(msg);
                break;
            }
            case constDef.CONNECT_CALLBACK_STATUS.LOGON_GET_PLAYERS_BASE_INFO:
            {
                cc.log("LOGON_GET_PLAYERS_BASE_INFO");
                let msg = new ProtocolMessage(constDef.MESSAGE.CMD_MAIN_PLATFORM,constDef.MESSAGE.GET_PLAYERS_BASE_INFO_REQ,false);         
                ProtocolMessage.AddVectItemInt(msg._body_msg, GlobalManager.instance.selfData.nAccountID);
                ProtocolMessage.AddVectItemInt(msg._body_msg, GlobalManager.instance.selfData.nCurGameID);

                let vectIndex = msg._body_msg.length;
                ProtocolMessage.AddVectItemVect(msg._body_msg);
                for(let i=0;i<gameData.vectTeamList.length;i++)
                {
                    if ((gameData.vectTeamList[i].nAccountID > 0) && (gameData.vectTeamList[i].nick==""))
                    {
                        ProtocolMessage.AddVectItemInt(msg._body_msg[vectIndex]._vect_value, gameData.vectTeamList[i].nAccountID);
                    }
                }
                GlobalManager.instance.SendLogonMsg(msg);
                break;
            }

            // ----------------------
            case gameConstDef.CONNECT_CALLBACK_STATUS.HOME_ENTER_ROOM:
            {
                var msg = new ProtocolMessage(constDef.MESSAGE.CMD_MAIN_PLATFORM, constDef.MESSAGE.ENTER_ROOM_REQ, false);
                ProtocolMessage.AddVectItemInt(msg._body_msg, GlobalManager.instance.selfData.nAccountID);
                ProtocolMessage.AddVectItemInt(msg._body_msg, GlobalManager.instance.selfData.nLogonTS);
                ProtocolMessage.AddVectItemInt(msg._body_msg, GlobalManager.instance.selfData.nLogonRand);
                ProtocolMessage.AddVectItemString(msg._body_msg, GlobalManager.instance.selfData.sLogonKey);
                GlobalManager.instance.SendGameMsg(msg);
                break;
            }  
             case gameConstDef.CONNECT_CALLBACK_STATUS.HOME_LEAVE_TEAM:
            {
                let msg = new ProtocolMessage(constDef.MESSAGE.CMD_MAIN_GAME,constDef.MESSAGE.LEAVE_TEAM_REQ,false); 
                GlobalManager.instance.SendGameMsg(msg);
                break;
            }  
        }
    },
});


