/* 平均值黑白 */

module.exports = "precision mediump float;\n"
                + "varying vec2 v_texCoord;\n"
                + "void main()\n"
                + "{\n"
                + "    vec3 v = texture2D(CC_Texture0, v_texCoord).rgb;\n"
                + "    float f = (v.r + v.g + v.b) / 3.0;\n"
                + "    gl_FragColor = vec4(f, f, f, 1.0);\n"
                + "}\n";