cc.Class({
    extends: cc.Component,

    properties: {
        strSoundFilePath:"resources/common/audio/",
    },

    onLoad: function () {

    },

    setSoundFilePath:function(val)
    {
        this.strSoundFilePath = val;
    },

    play: function(clip, isLoop) 
    {
        let url = clip;
        if (typeof clip == "string") 
        {
            url = cc.url.raw(this.strSoundFilePath + clip);
        }

        cc.audioEngine.playMusic(url, isLoop);
    },

    playEffect:function(clip, isLoop)
    {
        let url = clip;
        if (typeof clip == "string") 
        {
            url = cc.url.raw(this.strSoundFilePath + clip);
        }

        cc.audioEngine.playEffect(url, isLoop);
    },

    pause: function() 
    {
        cc.audioEngine.pauseMusic();
    },

    stop: function()
    {
        cc.audioEngine.stopMusic();
    },

    resume: function() 
    {
        cc.audioEngine.resumeMusic();
    },

});
