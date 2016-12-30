var GlobalManager = require("GlobalManager");
var constDef = require("ConstDef");

cc.Class({
    extends: cc.Component,

    properties: {
      
    },

    onLoad: function () {
        GlobalManager.instance.confData.loadConfJson();
        cc.director.loadScene("logon");
    }

});
