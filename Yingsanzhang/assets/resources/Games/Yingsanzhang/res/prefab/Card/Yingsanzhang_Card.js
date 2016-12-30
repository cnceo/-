var CardController = cc.Class({
    extends: cc.Component,

    properties: {
        //正面白底或者背面图案
        face_Img:{
            default:null,
            type:cc.Sprite
        },
        //A-10,J-K,大小王
        cardID_Img:{
            default:null,
            type:cc.Sprite
        },
        //小型牌种类图案
        small_type_Img:{
            default:null,
            type:cc.Sprite
        },
        //大型牌种类图案
        big_type_Img:{
            default:null,
            type:cc.Sprite
        },
        cardValue:0,
    },

    // use this for initialization
    onLoad: function () 
    {
    },
    SetDisCard:function(){

        let face_url = "Games/Yingsanzhang/res/prefab/Card/image/" + "backGray";
        cc.log("SetDisCard",face_url);
        let face_image = this.face_Img;
        cc.loader.loadRes(face_url, cc.SpriteFrame, function (error, spriteFrame) {
            if (!error) {
                face_image.spriteFrame = spriteFrame;
            }
        });

    },
    SetCardInfo:function(val)
    {
        this.cardValue = val;
        let face_image = this.face_Img;
        let cardID_image = this.cardID_Img;
        let small_type_image = this.small_type_Img;
        let big_type_image = this.big_type_Img;

        if ((val === 0) || (val >= 0x50))
        {
            cardID_image.node.opacity = 0;
            small_type_image.node.opacity = 0;
            big_type_image.node.opacity = 0;

            let face_url = "Games/Yingsanzhang/res/prefab/Card/image/" + "back";
            if (val == 0x5E)  face_url = "Games/Yingsanzhang/res/prefab/Card/image/" + "small_joker";
            else if (val == 0x5F)  face_url = "Games/Yingsanzhang/res/prefab/Card/image/" + "big_joker";

            cc.loader.loadRes(face_url, cc.SpriteFrame,function (error, spriteFrame) 
            {
                if (!error) 
                { 
                    face_image.spriteFrame = spriteFrame;
                }
            });
        }
        else
        {
            let face_url = "Games/Yingsanzhang/res/prefab/Card/image/" + "face"; 
            cc.loader.loadRes(face_url, cc.SpriteFrame,function (error, spriteFrame) 
            {
                if (!error) 
                { 
                    face_image.spriteFrame = spriteFrame;
                }
            });

            cardID_image.node.opacity = 255;
            small_type_image.node.opacity = 255;
            big_type_image.node.opacity = 255;

            let pukeKind = (val >> 4);
            let pukeVal = (val & 0xF);

            let small_Type_url = "Games/Yingsanzhang/res/prefab/Card/image/small_puke_kind_" + pukeKind.toString();
            let big_Type_url = "Games/Yingsanzhang/res/prefab/Card/image/big_puke_kind_" + pukeKind.toString();
            let cardID_name_url = "Games/Yingsanzhang/res/prefab/Card/image/black_flag/h" + pukeVal.toString();
            if (pukeKind%2===1) cardID_name_url = "Games/Yingsanzhang/res/prefab/Card/image/red_flag/h" + pukeVal.toString();
            
            cc.loader.loadRes(cardID_name_url, cc.SpriteFrame,function (error, spriteFrame) {
                if (!error) {
                    cardID_image.spriteFrame = spriteFrame;
                }
            });

            cc.loader.loadRes(small_Type_url, cc.SpriteFrame,function (error, spriteFrame) {
                if (!error) {
                    small_type_image.spriteFrame = spriteFrame;
                }
            });

            cc.loader.loadRes(big_Type_url, cc.SpriteFrame,function (error, spriteFrame) {
                if (!error) {
                    big_type_image.spriteFrame = spriteFrame;
                }
            });
        }
    },
});
