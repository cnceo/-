var CONNECT_CALLBACK_STATUS = cc.Enum({
   //===================【主命令】======================
    MIAN_LOGON      :0x0001,
    MIAN_GUIDE      :0x0002,
    MIAN_HOME       :0x0003,
    MIAN_CHAT       :0x0004,

   //==================【登录场景】======================
    LOGON_WAIT_LOGON                :   0X00010001,         // 等待登录
    LOGON_WAIT_REGISTER             :   0X00010002,         // 等待注册
    LOGON_GET_ONLINE_COUNT          :   0X00010003,         // 拉取游戏在线玩家人数
    LOGON_GET_GAME_INFO             :   0X00010004,         // 拉取游戏信息
    LOGON_GET_PLAYERS_BASE_INFO     :   0X00010005,         // 拉取玩家基本信息

    //===================【引导场景】====================   
    GUIDE_SET_CLIENT_DATA           :   0X00020001,          // 修改信息

    //===================【聊天场景】====================
    CHAT_WAIT_CHAT                  :   0X00040001,          // 等待聊天
    CHAT_WAIT_GET_CHAT              :   0X00040002,          // 拉取聊天记录
    CHAT_WAIT_GET_RELATION          :   0X00040003,          // 拉取好友关系
    CHAT_WAIT_SET_RELATION          :   0X00040004,          // 设置好友关系

    //==================================================  
    STATUS_INIT                     :   0,                    // 初始化，无动作 
   
});
var BACK_PACK_GOODS_MAIN_ID = 8000;
// -- [战斗开启模式] --
var BATTLE_OPEN_MODE = cc.Enum({
        TABLE : 1,  // 桌子模式
		COPY  : 2,  // 副本模式
		MAKE  : 4,  // 撮合模式
		WILD  : 8,  // 野战模式
		MATCH : 16, // 比赛模式

		CANCEL : 0xFF, // 取消
});

var MATCH_MODE = cc.Enum({
        NONE : 0,
		OUT_AT_ONCE : 1,
		FIXED_ROUND : 2,

		compatible_MAKE : 101, // 兼容速配模式
		compatible_DATE : 102, // 兼容约战模式
});

var MATCH_STATUS = cc.Enum({
        INIT          : 0,
		WAIT_POOL     : 1,
		PHASE_1_BEGIN : 2,
		PHASE_1_END   : 3,
		PHASE_2_BEGIN : 4,
		PHASE_2_END   : 5,
		PHASE_3_BEGIN : 6,
		PHASE_3_END   : 7,
		OVER          : 8,
		END           : 9,
		CANCEL        : 10,
});

var MATCH_RESULT = cc.Enum({
        NONE : 0,
		
		OutAtOnce_OUT   : 1,
		OutAtOnce_DOWN  : 2,
		OutAtOnce_UP    : 3,
		OutAtOnce_WIN   : 4,

		FixedRound_OUT  : 10,
		FixedRound_UP   : 11,
		FixedRound_WIN  : 12,

		ON_GAME_OVER    : 100,

		SEND_FUND_POOL  : 101,
});

var TIME = cc.Enum({
    DAY_LONG:86400,   // 60*60*24
    WEEK_LONG:604800, // DAY_LONG*7
    BEIJING_TIME_MARGIN:28800, // 60*60*8
});
		
var SERVER_URL = {
   logon: "ws://203.195.129.201:9004/",
   game: "",
   chat:"ws://203.195.129.201:9027/"
};

var FIGHT_RESULT = {
    DRAW:0,
    LOSE:1,
    WIN:2,

    // 刚进房间检查、扣除
    ENTER_ROOM  : 3,
    // 每场战斗前置扣费（抽水）
    PRE_FIGHT   : 4,
    // 每场战斗结束检查
    AFTER_FIGHT : 5,

    // 比赛报名费
    MATCH_SIGN   : 6, // 比赛报名
    MATCH_REVOKE : 7, // 撤销

    // -- 其他奖励
    N_Continue_AWARD : 8,
    MATCH_AWARD  : 9, // 比赛奖励(包含中途淘汰)


};

var MESSAGE = {
    // --------------------------------------------
    CMD_MAIN_KERNEL: 0x0000,
    // --------------------------------------------
    HEART: 0x0001,
    HEART_RSP: 0x0002,

    // --------------------------------------------
    CMD_MAIN_PLATFORM: 0x0001,
    // --------------------------------------------
    CREATE_ACCOUNT_REQ: 0x0001,
    CREATE_ACCOUNT_SUCCESS: 0x0002,
    CREATE_ACCOUNT_FAILED: 0x0003,
    GET_ACCOUNT_ID_REQ: 0x000a,
    GET_ACCOUNT_ID_SUCCESS: 0x000b,
    GET_ACCOUNT_ID_FAILED: 0x000c,
    LOGON_PLATFORM_REQ: 0x0010,
    LOGON_PLATFORM_SUCCESS: 0x0011,
    LOGON_PLATFORM_FAILED: 0x0012,
    SEND_ROOMS_NOTIFY: 0x0025,
    SEND_ROOMS_FINISH: 0x0026,
	UPDATE_ONLINE_COUNT_REQ: 0x0027,
    UPDATE_ONLINE_COUNT_SUCCESS: 0x0028,
    UPDATE_ONLINE_COUNT_FAILED: 0x0029,
    ENTER_ROOM_REQ: 0x002a,
    ENTER_ROOM_SUCCESS: 0x002b,
    ENTER_ROOM_FAILED: 0x002c,
    GET_ROOM_PLAYERS_REQ: 0x0030,
    SEND_ROOM_PLAYERS_NOTIFY: 0x0031,
    SEND_ROOM_TEAMS_NOTIFY:0x0032,
    SEND_ROOM_BATTLES_NOTIFY:0x0033, 
    SEND_ROOM_PLAYERS_FINISH: 0x0034,
    PLAYER_ENTER_ROOM_NOTIFY: 0x0035,
    PLAYER_LEAVE_ROOM_NOTIFY: 0x0036,
    GET_GAME_INFO_REQ: 0x003b,
    GET_GAME_INFO_SUCCESS: 0x003c,
    GET_GAME_INFO_FAILED: 0x003d,
    GET_PLAYERS_BASE_INFO_REQ: 0x0041,
    GET_PLAYERS_BASE_INFO_SUCCESS: 0x0042,
    GET_PLAYERS_BASE_INFO_FAILED: 0x0043,
    BALANCE_NOTIFY     : 0x004a, 
    // -- 聊天[HTTP]
	CHAT_REQ     : 0x004b,
	CHAT_SUCCESS : 0x004c,
	CHAT_FAILED  : 0x004d,
	// -- 拉取聊天记录[HTTP]
	GET_CHAT_REQ     : 0x004e,
	GET_CHAT_SUCCESS : 0x004f,
	GET_CHAT_FAILED  : 0x0050,
	// -- 拉取好友[HTTP]
	GET_RELATION_REQ     : 0x0051,
	GET_RELATION_SUCCESS : 0x0052,
	GET_RELATION_FAILED  : 0x0053,
	// -- 好友参数修改（关注、粉丝、黑名单、朋友圈权限等）[HTTP]
	SET_RELATION_REQ     : 0x0054,
	SET_RELATION_SUCCESS : 0x0055,
	SET_RELATION_FAILED  : 0x0056,

    // --------------------------------------------
    CMD_MAIN_GAME: 0x0002,
    // --------------------------------------------
    LEAVE_TEAM_REQ:0x0009,
    LEAVE_TEAM_NOTIFY:0x000c,
    TEAM_ALL_READY_REQ: 0x0018,
    TEAM_ALL_READY_SUCCESS: 0x0019,
    TEAM_ALL_READY_FAILED: 0x001a,
    TEAM_ALL_READY_NOTIFY: 0x001b,
    ENTER_BATTLE_REQ: 0x0024,
    ENTER_BATTLE_SUCCESS: 0x0025,
    ENTER_BATTLE_FAILED: 0x0026,
    ENTER_BATTLE_NOTIFY: 0x0027,
    FIGHT_READY_REQ: 0x002d,
    FIGHT_READY_SUCCESS: 0x002e,
    FIGHT_READY_FAILED: 0x002f,
    FIGHT_READY_NOTIFY: 0x0030,
    SCENE_READY_REQ: 0x0031,
    SCENE_READY_SUCCESS: 0x0032,
    SCENE_READY_FAILED: 0x0033,
    SCENE_READY_NOTIFY: 0x0034,
    FIGHT_BEGIN_NOTIFY: 0x0035,
    FIGHT_END_NOTIFY: 0x0036,
    FIGHT_STATUS_NOTIFY: 0x0037,
    GET_TEAM_MEMBERS_REQ: 0x0038,
    GET_TEAM_MEMBERS_SUCCESS: 0x0039,
    GET_TEAM_MEMBERS_FAILED: 0x0040,
    GET_MATCH_DATA_NOTIFY  : 0x003b,
    // -- 拉取比赛人数（人满即开、十分钟开赛等并发比赛）
	GET_MATCH_CUR_COUNT_REQ : 0x003c,
	GET_MATCH_CUR_COUNT_SUCCESS : 0x003d,
	GET_MATCH_CUR_COUNT_FAILED : 0x003e,
};

// -------------------------------------------------------

module.exports = {
   CONNECT_CALLBACK_STATUS: CONNECT_CALLBACK_STATUS,
   TIME:TIME,
   BACK_PACK_GOODS_MAIN_ID:BACK_PACK_GOODS_MAIN_ID,
   BATTLE_OPEN_MODE:BATTLE_OPEN_MODE,
   MATCH_MODE:MATCH_MODE,
   MATCH_STATUS:MATCH_STATUS,
   MATCH_RESULT:MATCH_RESULT,
   FIGHT_RESULT:FIGHT_RESULT,
   SERVER_URL: SERVER_URL,
   MESSAGE: MESSAGE,
};
