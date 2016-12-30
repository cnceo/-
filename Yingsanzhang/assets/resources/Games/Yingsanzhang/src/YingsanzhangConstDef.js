var CONNECT_CALLBACK_STATUS = cc.Enum({
   //===================【主命令】======================
    MIAN_LOGON      :0x0001,
    MIAN_GUIDE      :0x0002,
    MIAN_HOME       :0x0003,

    //===================【引导场景】====================   
    GUIDE_SET_CLIENT_DATA           :   0X00020001,          // 修改信息

    //====================【主场景】=====================   
    HOME_ENTER_ROOM                 :   0x00030001,           //进入房间
    
    HOME_LEAVE_TEAM                 :   0x00030002,           //离开队伍

    //==================================================  
    STATUS_INIT                     :   0,                    // 初始化，无动作 
   
});


var CARDS_TYPE = cc.Enum({
        NONE        : 0,   // 不符合规则
		TYPE_ER_SAN_WU          : 1,   // 1 235
		TYPE_Dan_ZHANG          : 2,   // 2 单张
		TYPE_DUI_ZI             : 3,   // 3 对子
		TYPE_SHUN_ZI            : 4,   // 4 顺子
		TYPE_TONG_HUA           : 5,   // 5 同花
		TYPE_TONG_HUA_SHUN      : 6,   // 6 同花顺
		TYPE_BAO_ZI             : 7,   // 7 豹子
});
var PLAYER_OPERATION_TYPE = {
    OPERATION_DISCARD:1,
    OPERATION_LOOKCARD:2,
    OPERATION_LOSE:3,
};
var FIGHT_RESULT = {
    LOSE:1,
    WIN:2,
};
var FIGHT_STATUS = cc.Enum({
    INIT:0,  
    BEGIN:1,     
    WAIT_BET:2,
    FIGHTING:3,
    END:4,

    C_READY_BEGIN:101,
    C_CANCEL_BEGIN:102,
    
    C_BEGIN:103,
    
    C_BEGIN_SEND_CARD:104, // 发三张牌 104 ~ 106
    
    C_BEGIN_SEND_READY:108, // 发完牌
    
    C_BET_START:110,
    
    C_END:115,     // 收到战斗战斗结束消息的时候设置为该状态（开牌、弹窗、飞钱、飘钱）

    C_END_P1:121,  // 播放弹窗前
    C_END_P2:122,  // 弹窗播放结束，紧接着播放飘钱
    C_END_FINISH:123,
});

var COIN_TYPE = cc.Enum({
   diamond: 0,       //钻石
   gold: 1           //金币 
}); 

var GAME_WAIT_TIME = {
    GRAB_BANKER_WAIT_TIME : 10,
    FIRST_OUT_CARD_WAIT_TIME : 25,
    OUT_CARD_WAIT_TIME : 25,    
    OUT_CARD_ONLY_PASEE_WAIT_TIME:10, 
    OUT_CARD_LESS_ONLY_PASEE_WAIT_TIME:3,
    ROCKET_WAIT_TIME:3,
    READY_WAIT_TIME:35,
};
var CARD_STATUS = cc.Enum({
    OPEN_CARD : 1,
    DARD_CARD : 2
});
var MESSAGE = {
    CMD_MAIN_YingSanZhang: 0x8001,
    // --------------------------------------------
    BET_REQ                     : 0x0001,
    BET_SUCCESS                 : 0x0002,
    BET_FAILED                  : 0x0003,
    BET_NOTIFY                  : 0x0004,

    FOLLOW_BET_REQ              : 0x0005,
    FOLLOW_BET_SUCCESS          : 0x0006,
    FOLLOW_BET_FAILED           : 0x0007,
    FOLLOW_BET_NOTIFY           : 0x0008,

    ADD_BET_REQ                 : 0x0009,
    ADD_BET_SUCCESS             : 0x00010,
    ADD_BET_FAILED              : 0x00011,
    ADD_BET_NOTIFY              : 0x00012,
    
    LOOK_CARD_REQ               : 0x00013,
    LOOK_CARD_SUCCESS           : 0x00014,
    LOOK_CARD_FAILED            : 0x00015,
    LOOK_CARD_NOTIFY            : 0x00016,
    
    DISCARD_REQ                 : 0x00017,
    DISCARD_SUCCESS             : 0x00018,
    DISCARD_FAILED              : 0x00019,
    DISCARD_NOTIFY              : 0x00020,    

    COMPARE_CARD_REQ            : 0x00021,
    COMPARE_CARD_SUCCESS        : 0x00022,
    COMPARE_CARD_FAILED         : 0x00023,
    COMPARE_CARD_NOTIFY         : 0x00024,        
};

// -------------------------------------------------------

module.exports = {
   PLAYER_OPERATION_TYPE:PLAYER_OPERATION_TYPE,
   CONNECT_CALLBACK_STATUS: CONNECT_CALLBACK_STATUS,
   MESSAGE: MESSAGE,
   COIN_TYPE: COIN_TYPE,
   FIGHT_STATUS:FIGHT_STATUS,
   GAME_WAIT_TIME:GAME_WAIT_TIME,
   CARD_STATUS:CARD_STATUS,
   CARDS_TYPE:CARDS_TYPE
};
