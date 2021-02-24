/*
 * WebGL Utils IIFE
 * ----------------------------------------------------------------------
 * Copyright 2012, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of his
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], function() {
            return factory.call(root);
        });
    } else {
        // Browser globals
        root.webglUtils = factory.call(root);
    }
}(this, function() {
    'use strict';

    const topWindow = this;

    /** @module webgl-utils */

    function isInIFrame(w) {
        w = w || topWindow;
        return w !== w.top;
    }

    if (!isInIFrame()) {
        console.log("%c%s", 'color:blue;font-weight:bold;', 'for more about webgl-utils.js see:');  // eslint-disable-line
        console.log("%c%s", 'color:blue;font-weight:bold;', 'https://webglfundamentals.org/webgl/lessons/webgl-boilerplate.html');  // eslint-disable-line
    }

    /**
     * Wrapped logging function.
     * @param {string} msg The message to log.
     */
    function error(msg) {
        if (topWindow.console) {
            if (topWindow.console.error) {
                topWindow.console.error(msg);
            } else if (topWindow.console.log) {
                topWindow.console.log(msg);
            }
        }
    }


    /**
     * Error Callback
     * @callback ErrorCallback
     * @param {string} msg error message.
     * @memberOf module:webgl-utils
     */


    /**
     * Loads a shader.
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
     * @param {string} shaderSource The shader source.
     * @param {number} shaderType The type of shader.
     * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors.
     * @return {WebGLShader} The created shader.
     */
    function loadShader(gl, shaderSource, shaderType, opt_errorCallback) {
        const errFn = opt_errorCallback || error;
        // Create the shader object
        const shader = gl.createShader(shaderType);

        // Load the shader source
        gl.shaderSource(shader, shaderSource);

        // Compile the shader
        gl.compileShader(shader);

        // Check the compile status
        const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!compiled) {
            // Something went wrong during compilation; get the error
            const lastError = gl.getShaderInfoLog(shader);
            errFn('*** Error compiling shader \'' + shader + '\':' + lastError + `\n` + shaderSource.split('\n').map((l,i) => `${i + 1}: ${l}`).join('\n'));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    /**
     * Creates a program, attaches shaders, binds attrib locations, links the
     * program and calls useProgram.
     * @param {WebGLShader[]} shaders The shaders to attach
     * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
     * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
     * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
     *        on error. If you want something else pass an callback. It's passed an error message.
     * @memberOf module:webgl-utils
     */
    function createProgram(
        gl, shaders, opt_attribs, opt_locations, opt_errorCallback) {
        const errFn = opt_errorCallback || error;
        const program = gl.createProgram();
        shaders.forEach(function(shader) {
            gl.attachShader(program, shader);
        });
        if (opt_attribs) {
            opt_attribs.forEach(function(attrib, ndx) {
                gl.bindAttribLocation(
                    program,
                    opt_locations ? opt_locations[ndx] : ndx,
                    attrib);
            });
        }
        gl.linkProgram(program);

        // Check the link status
        const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!linked) {
            // something went wrong with the link
            const lastError = gl.getProgramInfoLog(program);
            errFn('Error in program linking:' + lastError);

            gl.deleteProgram(program);
            return null;
        }
        return program;
    }

    /**
     * Loads a shader from a script tag.
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
     * @param {string} scriptId The id of the script tag.
     * @param {number} opt_shaderType The type of shader. If not passed in it will
     *     be derived from the type of the script tag.
     * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors.
     * @return {WebGLShader} The created shader.
     */
    function createShaderFromScript(
        gl, scriptId, opt_shaderType, opt_errorCallback) {
        let shaderSource = '';
        let shaderType;
        const shaderScript = document.getElementById(scriptId);
        if (!shaderScript) {
            throw ('*** Error: unknown script element' + scriptId);
        }
        shaderSource = shaderScript.text;

        if (!opt_shaderType) {
            if (shaderScript.type === 'x-shader/x-vertex') {
                shaderType = gl.VERTEX_SHADER;
            } else if (shaderScript.type === 'x-shader/x-fragment') {
                shaderType = gl.FRAGMENT_SHADER;
            } else if (shaderType !== gl.VERTEX_SHADER && shaderType !== gl.FRAGMENT_SHADER) {
                throw ('*** Error: unknown shader type');
            }
        }

        return loadShader(
            gl, shaderSource, opt_shaderType ? opt_shaderType : shaderType,
            opt_errorCallback);
    }

    const defaultShaderType = [
        'VERTEX_SHADER',
        'FRAGMENT_SHADER',
    ];

    /**
     * Creates a program from 2 script tags.
     *
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext
     *        to use.
     * @param {string[]} shaderScriptIds Array of ids of the script
     *        tags for the shaders. The first is assumed to be the
     *        vertex shader, the second the fragment shader.
     * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
     * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
     * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
     *        on error. If you want something else pass an callback. It's passed an error message.
     * @return {WebGLProgram} The created program.
     * @memberOf module:webgl-utils
     */
    function createProgramFromScripts(
        gl, shaderScriptIds, opt_attribs, opt_locations, opt_errorCallback) {
        const shaders = [];
        for (let ii = 0; ii < shaderScriptIds.length; ++ii) {
            shaders.push(createShaderFromScript(
                gl, shaderScriptIds[ii], gl[defaultShaderType[ii]], opt_errorCallback));
        }
        return createProgram(gl, shaders, opt_attribs, opt_locations, opt_errorCallback);
    }

    /**
     * Creates a program from 2 sources.
     *
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext
     *        to use.
     * @param {string[]} shaderSourcess Array of sources for the
     *        shaders. The first is assumed to be the vertex shader,
     *        the second the fragment shader.
     * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
     * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
     * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
     *        on error. If you want something else pass an callback. It's passed an error message.
     * @return {WebGLProgram} The created program.
     * @memberOf module:webgl-utils
     */
    function createProgramFromSources(
        gl, shaderSources, opt_attribs, opt_locations, opt_errorCallback) {
        const shaders = [];
        for (let ii = 0; ii < shaderSources.length; ++ii) {
            shaders.push(loadShader(
                gl, shaderSources[ii], gl[defaultShaderType[ii]], opt_errorCallback));
        }
        return createProgram(gl, shaders, opt_attribs, opt_locations, opt_errorCallback);
    }

    /**
     * Returns the corresponding bind point for a given sampler type
     */
    function getBindPointForSamplerType(gl, type) {
        if (type === gl.SAMPLER_2D)   return gl.TEXTURE_2D;        // eslint-disable-line
        if (type === gl.SAMPLER_CUBE) return gl.TEXTURE_CUBE_MAP;  // eslint-disable-line
        return undefined;
    }

    /**
     * @typedef {Object.<string, function>} Setters
     */

    /**
     * Creates setter functions for all uniforms of a shader
     * program.
     *
     * @see {@link module:webgl-utils.setUniforms}
     *
     * @param {WebGLProgram} program the program to create setters for.
     * @returns {Object.<string, function>} an object with a setter by name for each uniform
     * @memberOf module:webgl-utils
     */
    function createUniformSetters(gl, program) {
        let textureUnit = 0;

        /**
         * Creates a setter for a uniform of the given program with it's
         * location embedded in the setter.
         * @param {WebGLProgram} program
         * @param {WebGLUniformInfo} uniformInfo
         * @returns {function} the created setter.
         */
        function createUniformSetter(program, uniformInfo) {
            const location = gl.getUniformLocation(program, uniformInfo.name);
            const type = uniformInfo.type;
            // Check if this uniform is an array
            const isArray = (uniformInfo.size > 1 && uniformInfo.name.substr(-3) === '[0]');
            if (type === gl.FLOAT && isArray) {
                return function(v) {
                    gl.uniform1fv(location, v);
                };
            }
            if (type === gl.FLOAT) {
                return function(v) {
                    gl.uniform1f(location, v);
                };
            }
            if (type === gl.FLOAT_VEC2) {
                return function(v) {
                    gl.uniform2fv(location, v);
                };
            }
            if (type === gl.FLOAT_VEC3) {
                return function(v) {
                    gl.uniform3fv(location, v);
                };
            }
            if (type === gl.FLOAT_VEC4) {
                return function(v) {
                    gl.uniform4fv(location, v);
                };
            }
            if (type === gl.INT && isArray) {
                return function(v) {
                    gl.uniform1iv(location, v);
                };
            }
            if (type === gl.INT) {
                return function(v) {
                    gl.uniform1i(location, v);
                };
            }
            if (type === gl.INT_VEC2) {
                return function(v) {
                    gl.uniform2iv(location, v);
                };
            }
            if (type === gl.INT_VEC3) {
                return function(v) {
                    gl.uniform3iv(location, v);
                };
            }
            if (type === gl.INT_VEC4) {
                return function(v) {
                    gl.uniform4iv(location, v);
                };
            }
            if (type === gl.BOOL) {
                return function(v) {
                    gl.uniform1iv(location, v);
                };
            }
            if (type === gl.BOOL_VEC2) {
                return function(v) {
                    gl.uniform2iv(location, v);
                };
            }
            if (type === gl.BOOL_VEC3) {
                return function(v) {
                    gl.uniform3iv(location, v);
                };
            }
            if (type === gl.BOOL_VEC4) {
                return function(v) {
                    gl.uniform4iv(location, v);
                };
            }
            if (type === gl.FLOAT_MAT2) {
                return function(v) {
                    gl.uniformMatrix2fv(location, false, v);
                };
            }
            if (type === gl.FLOAT_MAT3) {
                return function(v) {
                    gl.uniformMatrix3fv(location, false, v);
                };
            }
            if (type === gl.FLOAT_MAT4) {
                return function(v) {
                    gl.uniformMatrix4fv(location, false, v);
                };
            }
            if ((type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) && isArray) {
                const units = [];
                for (let ii = 0; ii < info.size; ++ii) {
                    units.push(textureUnit++);
                }
                return function(bindPoint, units) {
                    return function(textures) {
                        gl.uniform1iv(location, units);
                        textures.forEach(function(texture, index) {
                            gl.activeTexture(gl.TEXTURE0 + units[index]);
                            gl.bindTexture(bindPoint, texture);
                        });
                    };
                }(getBindPointForSamplerType(gl, type), units);
            }
            if (type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) {
                return function(bindPoint, unit) {
                    return function(texture) {
                        gl.uniform1i(location, unit);
                        gl.activeTexture(gl.TEXTURE0 + unit);
                        gl.bindTexture(bindPoint, texture);
                    };
                }(getBindPointForSamplerType(gl, type), textureUnit++);
            }
            throw ('unknown type: 0x' + type.toString(16)); // we should never get here.
        }

        const uniformSetters = { };
        const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

        for (let ii = 0; ii < numUniforms; ++ii) {
            const uniformInfo = gl.getActiveUniform(program, ii);
            if (!uniformInfo) {
                break;
            }
            let name = uniformInfo.name;
            // remove the array suffix.
            if (name.substr(-3) === '[0]') {
                name = name.substr(0, name.length - 3);
            }
            const setter = createUniformSetter(program, uniformInfo);
            uniformSetters[name] = setter;
        }
        return uniformSetters;
    }

    /**
     * Set uniforms and binds related textures.
     *
     * Example:
     *
     *     let programInfo = createProgramInfo(
     *         gl, ["some-vs", "some-fs"]);
     *
     *     let tex1 = gl.createTexture();
     *     let tex2 = gl.createTexture();
     *
     *     ... assume we setup the textures with data ...
     *
     *     let uniforms = {
     *       u_someSampler: tex1,
     *       u_someOtherSampler: tex2,
     *       u_someColor: [1,0,0,1],
     *       u_somePosition: [0,1,1],
     *       u_someMatrix: [
     *         1,0,0,0,
     *         0,1,0,0,
     *         0,0,1,0,
     *         0,0,0,0,
     *       ],
     *     };
     *
     *     gl.useProgram(program);
     *
     * This will automatically bind the textures AND set the
     * uniforms.
     *
     *     setUniforms(programInfo.uniformSetters, uniforms);
     *
     * For the example above it is equivalent to
     *
     *     let texUnit = 0;
     *     gl.activeTexture(gl.TEXTURE0 + texUnit);
     *     gl.bindTexture(gl.TEXTURE_2D, tex1);
     *     gl.uniform1i(u_someSamplerLocation, texUnit++);
     *     gl.activeTexture(gl.TEXTURE0 + texUnit);
     *     gl.bindTexture(gl.TEXTURE_2D, tex2);
     *     gl.uniform1i(u_someSamplerLocation, texUnit++);
     *     gl.uniform4fv(u_someColorLocation, [1, 0, 0, 1]);
     *     gl.uniform3fv(u_somePositionLocation, [0, 1, 1]);
     *     gl.uniformMatrix4fv(u_someMatrix, false, [
     *         1,0,0,0,
     *         0,1,0,0,
     *         0,0,1,0,
     *         0,0,0,0,
     *       ]);
     *
     * Note it is perfectly reasonable to call `setUniforms` multiple times. For example
     *
     *     let uniforms = {
     *       u_someSampler: tex1,
     *       u_someOtherSampler: tex2,
     *     };
     *
     *     let moreUniforms {
     *       u_someColor: [1,0,0,1],
     *       u_somePosition: [0,1,1],
     *       u_someMatrix: [
     *         1,0,0,0,
     *         0,1,0,0,
     *         0,0,1,0,
     *         0,0,0,0,
     *       ],
     *     };
     *
     *     setUniforms(programInfo.uniformSetters, uniforms);
     *     setUniforms(programInfo.uniformSetters, moreUniforms);
     *
     * @param {Object.<string, function>|module:webgl-utils.ProgramInfo} setters the setters returned from
     *        `createUniformSetters` or a ProgramInfo from {@link module:webgl-utils.createProgramInfo}.
     * @param {Object.<string, value>} an object with values for the
     *        uniforms.
     * @memberOf module:webgl-utils
     */
    function setUniforms(setters, ...values) {
        setters = setters.uniformSetters || setters;
        for (const uniforms of values) {
            Object.keys(uniforms).forEach(function(name) {
                const setter = setters[name];
                if (setter) {
                    setter(uniforms[name]);
                }
            });
        }
    }

    /**
     * Creates setter functions for all attributes of a shader
     * program. You can pass this to {@link module:webgl-utils.setBuffersAndAttributes} to set all your buffers and attributes.
     *
     * @see {@link module:webgl-utils.setAttributes} for example
     * @param {WebGLProgram} program the program to create setters for.
     * @return {Object.<string, function>} an object with a setter for each attribute by name.
     * @memberOf module:webgl-utils
     */
    function createAttributeSetters(gl, program) {
        const attribSetters = {
        };

        function createAttribSetter(index) {
            return function(b) {
                if (b.value) {
                    gl.disableVertexAttribArray(index);
                    switch (b.value.length) {
                        case 4:
                            gl.vertexAttrib4fv(index, b.value);
                            break;
                        case 3:
                            gl.vertexAttrib3fv(index, b.value);
                            break;
                        case 2:
                            gl.vertexAttrib2fv(index, b.value);
                            break;
                        case 1:
                            gl.vertexAttrib1fv(index, b.value);
                            break;
                        default:
                            throw new Error('the length of a float constant value must be between 1 and 4!');
                    }
                } else {
                    gl.bindBuffer(gl.ARRAY_BUFFER, b.buffer);
                    gl.enableVertexAttribArray(index);
                    gl.vertexAttribPointer(
                        index, b.numComponents || b.size, b.type || gl.FLOAT, b.normalize || false, b.stride || 0, b.offset || 0);
                }
            };
        }

        const numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
        for (let ii = 0; ii < numAttribs; ++ii) {
            const attribInfo = gl.getActiveAttrib(program, ii);
            if (!attribInfo) {
                break;
            }
            const index = gl.getAttribLocation(program, attribInfo.name);
            attribSetters[attribInfo.name] = createAttribSetter(index);
        }

        return attribSetters;
    }

    /**
     * Sets attributes and binds buffers (deprecated... use {@link module:webgl-utils.setBuffersAndAttributes})
     *
     * Example:
     *
     *     let program = createProgramFromScripts(
     *         gl, ["some-vs", "some-fs"]);
     *
     *     let attribSetters = createAttributeSetters(program);
     *
     *     let positionBuffer = gl.createBuffer();
     *     let texcoordBuffer = gl.createBuffer();
     *
     *     let attribs = {
     *       a_position: {buffer: positionBuffer, numComponents: 3},
     *       a_texcoord: {buffer: texcoordBuffer, numComponents: 2},
     *     };
     *
     *     gl.useProgram(program);
     *
     * This will automatically bind the buffers AND set the
     * attributes.
     *
     *     setAttributes(attribSetters, attribs);
     *
     * Properties of attribs. For each attrib you can add
     * properties:
     *
     * *   type: the type of data in the buffer. Default = gl.FLOAT
     * *   normalize: whether or not to normalize the data. Default = false
     * *   stride: the stride. Default = 0
     * *   offset: offset into the buffer. Default = 0
     *
     * For example if you had 3 value float positions, 2 value
     * float texcoord and 4 value uint8 colors you'd setup your
     * attribs like this
     *
     *     let attribs = {
     *       a_position: {buffer: positionBuffer, numComponents: 3},
     *       a_texcoord: {buffer: texcoordBuffer, numComponents: 2},
     *       a_color: {
     *         buffer: colorBuffer,
     *         numComponents: 4,
     *         type: gl.UNSIGNED_BYTE,
     *         normalize: true,
     *       },
     *     };
     *
     * @param {Object.<string, function>|model:webgl-utils.ProgramInfo} setters Attribute setters as returned from createAttributeSetters or a ProgramInfo as returned {@link module:webgl-utils.createProgramInfo}
     * @param {Object.<string, module:webgl-utils.AttribInfo>} attribs AttribInfos mapped by attribute name.
     * @memberOf module:webgl-utils
     * @deprecated use {@link module:webgl-utils.setBuffersAndAttributes}
     */
    function setAttributes(setters, attribs) {
        setters = setters.attribSetters || setters;
        Object.keys(attribs).forEach(function(name) {
            const setter = setters[name];
            if (setter) {
                setter(attribs[name]);
            }
        });
    }

    /**
     * Creates a vertex array object and then sets the attributes
     * on it
     *
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext
     *        to use.
     * @param {Object.<string, function>} setters Attribute setters as returned from createAttributeSetters
     * @param {Object.<string, module:webgl-utils.AttribInfo>} attribs AttribInfos mapped by attribute name.
     * @param {WebGLBuffer} [indices] an optional ELEMENT_ARRAY_BUFFER of indices
     */
    function createVAOAndSetAttributes(gl, setters, attribs, indices) {
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        setAttributes(setters, attribs);
        if (indices) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
        }
        // We unbind this because otherwise any change to ELEMENT_ARRAY_BUFFER
        // like when creating buffers for other stuff will mess up this VAO's binding
        gl.bindVertexArray(null);
        return vao;
    }

    /**
     * Creates a vertex array object and then sets the attributes
     * on it
     *
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext
     *        to use.
     * @param {Object.<string, function>| module:webgl-utils.ProgramInfo} programInfo as returned from createProgramInfo or Attribute setters as returned from createAttributeSetters
     * @param {module:webgl-utils:BufferInfo} bufferInfo BufferInfo as returned from createBufferInfoFromArrays etc...
     * @param {WebGLBuffer} [indices] an optional ELEMENT_ARRAY_BUFFER of indices
     */
    function createVAOFromBufferInfo(gl, programInfo, bufferInfo) {
        return createVAOAndSetAttributes(gl, programInfo.attribSetters || programInfo, bufferInfo.attribs, bufferInfo.indices);
    }

    /**
     * @typedef {Object} ProgramInfo
     * @property {WebGLProgram} program A shader program
     * @property {Object<string, function>} uniformSetters: object of setters as returned from createUniformSetters,
     * @property {Object<string, function>} attribSetters: object of setters as returned from createAttribSetters,
     * @memberOf module:webgl-utils
     */

    /**
     * Creates a ProgramInfo from 2 sources.
     *
     * A ProgramInfo contains
     *
     *     programInfo = {
     *        program: WebGLProgram,
     *        uniformSetters: object of setters as returned from createUniformSetters,
     *        attribSetters: object of setters as returned from createAttribSetters,
     *     }
     *
     * @param {WebGLRenderingContext} gl The WebGLRenderingContext
     *        to use.
     * @param {string[]} shaderSourcess Array of sources for the
     *        shaders or ids. The first is assumed to be the vertex shader,
     *        the second the fragment shader.
     * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
     * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
     * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
     *        on error. If you want something else pass an callback. It's passed an error message.
     * @return {module:webgl-utils.ProgramInfo} The created program.
     * @memberOf module:webgl-utils
     */
    function createProgramInfo(
        gl, shaderSources, opt_attribs, opt_locations, opt_errorCallback) {
        shaderSources = shaderSources.map(function(source) {
            const script = document.getElementById(source);
            return script ? script.text : source;
        });
        const program = webglUtils.createProgramFromSources(gl, shaderSources, opt_attribs, opt_locations, opt_errorCallback);
        if (!program) {
            return null;
        }
        const uniformSetters = createUniformSetters(gl, program);
        const attribSetters = createAttributeSetters(gl, program);
        return {
            program: program,
            uniformSetters: uniformSetters,
            attribSetters: attribSetters,
        };
    }

    /**
     * Sets attributes and buffers including the `ELEMENT_ARRAY_BUFFER` if appropriate
     *
     * Example:
     *
     *     let programInfo = createProgramInfo(
     *         gl, ["some-vs", "some-fs"]);
     *
     *     let arrays = {
     *       position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
     *       texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
     *     };
     *
     *     let bufferInfo = createBufferInfoFromArrays(gl, arrays);
     *
     *     gl.useProgram(programInfo.program);
     *
     * This will automatically bind the buffers AND set the
     * attributes.
     *
     *     setBuffersAndAttributes(programInfo.attribSetters, bufferInfo);
     *
     * For the example above it is equivilent to
     *
     *     gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
     *     gl.enableVertexAttribArray(a_positionLocation);
     *     gl.vertexAttribPointer(a_positionLocation, 3, gl.FLOAT, false, 0, 0);
     *     gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
     *     gl.enableVertexAttribArray(a_texcoordLocation);
     *     gl.vertexAttribPointer(a_texcoordLocation, 4, gl.FLOAT, false, 0, 0);
     *
     * @param {WebGLRenderingContext} gl A WebGLRenderingContext.
     * @param {Object.<string, function>} setters Attribute setters as returned from `createAttributeSetters`
     * @param {module:webgl-utils.BufferInfo} buffers a BufferInfo as returned from `createBufferInfoFromArrays`.
     * @memberOf module:webgl-utils
     */
    function setBuffersAndAttributes(gl, setters, buffers) {
        setAttributes(setters, buffers.attribs);
        if (buffers.indices) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
        }
    }

    // Add your prefix here.
    const browserPrefixes = [
        '',
        'MOZ_',
        'OP_',
        'WEBKIT_',
    ];

    /**
     * Given an extension name like WEBGL_compressed_texture_s3tc
     * returns the supported version extension, like
     * WEBKIT_WEBGL_compressed_teture_s3tc
     * @param {string} name Name of extension to look for
     * @return {WebGLExtension} The extension or undefined if not
     *     found.
     * @memberOf module:webgl-utils
     */
    function getExtensionWithKnownPrefixes(gl, name) {
        for (let ii = 0; ii < browserPrefixes.length; ++ii) {
            const prefixedName = browserPrefixes[ii] + name;
            const ext = gl.getExtension(prefixedName);
            if (ext) {
                return ext;
            }
        }
        return undefined;
    }

    /**
     * Resize a canvas to match the size its displayed.
     * @param {HTMLCanvasElement} canvas The canvas to resize.
     * @param {number} [multiplier] amount to multiply by.
     *    Pass in window.devicePixelRatio for native pixels.
     * @return {boolean} true if the canvas was resized.
     * @memberOf module:webgl-utils
     */
    function resizeCanvasToDisplaySize(canvas, multiplier) {
        multiplier = multiplier || 1;
        const width  = canvas.clientWidth  * multiplier | 0;
        const height = canvas.clientHeight * multiplier | 0;
        if (canvas.width !== width ||  canvas.height !== height) {
            canvas.width  = width;
            canvas.height = height;
            return true;
        }
        return false;
    }

    // Add `push` to a typed array. It just keeps a 'cursor'
    // and allows use to `push` values into the array so we
    // don't have to manually compute offsets
    function augmentTypedArray(typedArray, numComponents) {
        let cursor = 0;
        typedArray.push = function() {
            for (let ii = 0; ii < arguments.length; ++ii) {
                const value = arguments[ii];
                if (value instanceof Array || (value.buffer && value.buffer instanceof ArrayBuffer)) {
                    for (let jj = 0; jj < value.length; ++jj) {
                        typedArray[cursor++] = value[jj];
                    }
                } else {
                    typedArray[cursor++] = value;
                }
            }
        };
        typedArray.reset = function(opt_index) {
            cursor = opt_index || 0;
        };
        typedArray.numComponents = numComponents;
        Object.defineProperty(typedArray, 'numElements', {
            get: function() {
                return this.length / this.numComponents | 0;
            },
        });
        return typedArray;
    }

    /**
     * creates a typed array with a `push` function attached
     * so that you can easily *push* values.
     *
     * `push` can take multiple arguments. If an argument is an array each element
     * of the array will be added to the typed array.
     *
     * Example:
     *
     *     let array = createAugmentedTypedArray(3, 2);  // creates a Float32Array with 6 values
     *     array.push(1, 2, 3);
     *     array.push([4, 5, 6]);
     *     // array now contains [1, 2, 3, 4, 5, 6]
     *
     * Also has `numComponents` and `numElements` properties.
     *
     * @param {number} numComponents number of components
     * @param {number} numElements number of elements. The total size of the array will be `numComponents * numElements`.
     * @param {constructor} opt_type A constructor for the type. Default = `Float32Array`.
     * @return {ArrayBuffer} A typed array.
     * @memberOf module:webgl-utils
     */
    function createAugmentedTypedArray(numComponents, numElements, opt_type) {
        const Type = opt_type || Float32Array;
        return augmentTypedArray(new Type(numComponents * numElements), numComponents);
    }

    function createBufferFromTypedArray(gl, array, type, drawType) {
        type = type || gl.ARRAY_BUFFER;
        const buffer = gl.createBuffer();
        gl.bindBuffer(type, buffer);
        gl.bufferData(type, array, drawType || gl.STATIC_DRAW);
        return buffer;
    }

    function allButIndices(name) {
        return name !== 'indices';
    }

    function createMapping(obj) {
        const mapping = {};
        Object.keys(obj).filter(allButIndices).forEach(function(key) {
            mapping['a_' + key] = key;
        });
        return mapping;
    }

    function getGLTypeForTypedArray(gl, typedArray) {
        if (typedArray instanceof Int8Array)    { return gl.BYTE; }            // eslint-disable-line
        if (typedArray instanceof Uint8Array)   { return gl.UNSIGNED_BYTE; }   // eslint-disable-line
        if (typedArray instanceof Int16Array)   { return gl.SHORT; }           // eslint-disable-line
        if (typedArray instanceof Uint16Array)  { return gl.UNSIGNED_SHORT; }  // eslint-disable-line
        if (typedArray instanceof Int32Array)   { return gl.INT; }             // eslint-disable-line
        if (typedArray instanceof Uint32Array)  { return gl.UNSIGNED_INT; }    // eslint-disable-line
        if (typedArray instanceof Float32Array) { return gl.FLOAT; }           // eslint-disable-line
        throw 'unsupported typed array type';
    }

    // This is really just a guess. Though I can't really imagine using
    // anything else? Maybe for some compression?
    function getNormalizationForTypedArray(typedArray) {
        if (typedArray instanceof Int8Array)    { return true; }  // eslint-disable-line
        if (typedArray instanceof Uint8Array)   { return true; }  // eslint-disable-line
        return false;
    }

    function isArrayBuffer(a) {
        return a.buffer && a.buffer instanceof ArrayBuffer;
    }

    function guessNumComponentsFromName(name, length) {
        let numComponents;
        if (name.indexOf('coord') >= 0) {
            numComponents = 2;
        } else if (name.indexOf('color') >= 0) {
            numComponents = 4;
        } else {
            numComponents = 3;  // position, normals, indices ...
        }

        if (length % numComponents > 0) {
            throw 'can not guess numComponents. You should specify it.';
        }

        return numComponents;
    }

    function makeTypedArray(array, name) {
        if (isArrayBuffer(array)) {
            return array;
        }

        if (array.data && isArrayBuffer(array.data)) {
            return array.data;
        }

        if (Array.isArray(array)) {
            array = {
                data: array,
            };
        }

        if (!array.numComponents) {
            array.numComponents = guessNumComponentsFromName(name, array.length);
        }

        let type = array.type;
        if (!type) {
            if (name === 'indices') {
                type = Uint16Array;
            }
        }
        const typedArray = createAugmentedTypedArray(array.numComponents, array.data.length / array.numComponents | 0, type);
        typedArray.push(array.data);
        return typedArray;
    }

    /**
     * @typedef {Object} AttribInfo
     * @property {number} [numComponents] the number of components for this attribute.
     * @property {number} [size] the number of components for this attribute.
     * @property {number} [type] the type of the attribute (eg. `gl.FLOAT`, `gl.UNSIGNED_BYTE`, etc...) Default = `gl.FLOAT`
     * @property {boolean} [normalized] whether or not to normalize the data. Default = false
     * @property {number} [offset] offset into buffer in bytes. Default = 0
     * @property {number} [stride] the stride in bytes per element. Default = 0
     * @property {WebGLBuffer} buffer the buffer that contains the data for this attribute
     * @memberOf module:webgl-utils
     */


    /**
     * Creates a set of attribute data and WebGLBuffers from set of arrays
     *
     * Given
     *
     *      let arrays = {
     *        position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
     *        texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
     *        normal:   { numComponents: 3, data: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],     },
     *        color:    { numComponents: 4, data: [255, 255, 255, 255, 255, 0, 0, 255, 0, 0, 255, 255], type: Uint8Array, },
     *        indices:  { numComponents: 3, data: [0, 1, 2, 1, 2, 3],                       },
     *      };
     *
     * returns something like
     *
     *      let attribs = {
     *        a_position: { numComponents: 3, type: gl.FLOAT,         normalize: false, buffer: WebGLBuffer, },
     *        a_texcoord: { numComponents: 2, type: gl.FLOAT,         normalize: false, buffer: WebGLBuffer, },
     *        a_normal:   { numComponents: 3, type: gl.FLOAT,         normalize: false, buffer: WebGLBuffer, },
     *        a_color:    { numComponents: 4, type: gl.UNSIGNED_BYTE, normalize: true,  buffer: WebGLBuffer, },
     *      };
     *
     * @param {WebGLRenderingContext} gl The webgl rendering context.
     * @param {Object.<string, array|typedarray>} arrays The arrays
     * @param {Object.<string, string>} [opt_mapping] mapping from attribute name to array name.
     *     if not specified defaults to "a_name" -> "name".
     * @return {Object.<string, module:webgl-utils.AttribInfo>} the attribs
     * @memberOf module:webgl-utils
     */
    function createAttribsFromArrays(gl, arrays, opt_mapping) {
        const mapping = opt_mapping || createMapping(arrays);
        const attribs = {};
        Object.keys(mapping).forEach(function(attribName) {
            const bufferName = mapping[attribName];
            const origArray = arrays[bufferName];
            if (origArray.value) {
                attribs[attribName] = {
                    value: origArray.value,
                };
            } else {
                const array = makeTypedArray(origArray, bufferName);
                attribs[attribName] = {
                    buffer:        createBufferFromTypedArray(gl, array),
                    numComponents: origArray.numComponents || array.numComponents || guessNumComponentsFromName(bufferName),
                    type:          getGLTypeForTypedArray(gl, array),
                    normalize:     getNormalizationForTypedArray(array),
                };
            }
        });
        return attribs;
    }

    function getArray(array) {
        return array.length ? array : array.data;
    }

    const texcoordRE = /coord|texture/i;
    const colorRE = /color|colour/i;

    function guessNumComponentsFromName(name, length) {
        let numComponents;
        if (texcoordRE.test(name)) {
            numComponents = 2;
        } else if (colorRE.test(name)) {
            numComponents = 4;
        } else {
            numComponents = 3;  // position, normals, indices ...
        }

        if (length % numComponents > 0) {
            throw new Error(`Can not guess numComponents for attribute '${name}'. Tried ${numComponents} but ${length} values is not evenly divisible by ${numComponents}. You should specify it.`);
        }

        return numComponents;
    }

    function getNumComponents(array, arrayName) {
        return array.numComponents || array.size || guessNumComponentsFromName(arrayName, getArray(array).length);
    }

    /**
     * tries to get the number of elements from a set of arrays.
     */
    const positionKeys = ['position', 'positions', 'a_position'];
    function getNumElementsFromNonIndexedArrays(arrays) {
        let key;
        for (const k of positionKeys) {
            if (k in arrays) {
                key = k;
                break;
            }
        }
        key = key || Object.keys(arrays)[0];
        const array = arrays[key];
        const length = getArray(array).length;
        const numComponents = getNumComponents(array, key);
        const numElements = length / numComponents;
        if (length % numComponents > 0) {
            throw new Error(`numComponents ${numComponents} not correct for length ${length}`);
        }
        return numElements;
    }

    /**
     * @typedef {Object} BufferInfo
     * @property {number} numElements The number of elements to pass to `gl.drawArrays` or `gl.drawElements`.
     * @property {WebGLBuffer} [indices] The indices `ELEMENT_ARRAY_BUFFER` if any indices exist.
     * @property {Object.<string, module:webgl-utils.AttribInfo>} attribs The attribs approriate to call `setAttributes`
     * @memberOf module:webgl-utils
     */


    /**
     * Creates a BufferInfo from an object of arrays.
     *
     * This can be passed to {@link module:webgl-utils.setBuffersAndAttributes} and to
     * {@link module:webgl-utils:drawBufferInfo}.
     *
     * Given an object like
     *
     *     let arrays = {
     *       position: { numComponents: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
     *       texcoord: { numComponents: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
     *       normal:   { numComponents: 3, data: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],     },
     *       indices:  { numComponents: 3, data: [0, 1, 2, 1, 2, 3],                       },
     *     };
     *
     *  Creates an BufferInfo like this
     *
     *     bufferInfo = {
     *       numElements: 4,        // or whatever the number of elements is
     *       indices: WebGLBuffer,  // this property will not exist if there are no indices
     *       attribs: {
     *         a_position: { buffer: WebGLBuffer, numComponents: 3, },
     *         a_normal:   { buffer: WebGLBuffer, numComponents: 3, },
     *         a_texcoord: { buffer: WebGLBuffer, numComponents: 2, },
     *       },
     *     };
     *
     *  The properties of arrays can be JavaScript arrays in which case the number of components
     *  will be guessed.
     *
     *     let arrays = {
     *        position: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0],
     *        texcoord: [0, 0, 0, 1, 1, 0, 1, 1],
     *        normal:   [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
     *        indices:  [0, 1, 2, 1, 2, 3],
     *     };
     *
     *  They can also by TypedArrays
     *
     *     let arrays = {
     *        position: new Float32Array([0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0]),
     *        texcoord: new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]),
     *        normal:   new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]),
     *        indices:  new Uint16Array([0, 1, 2, 1, 2, 3]),
     *     };
     *
     *  Or augmentedTypedArrays
     *
     *     let positions = createAugmentedTypedArray(3, 4);
     *     let texcoords = createAugmentedTypedArray(2, 4);
     *     let normals   = createAugmentedTypedArray(3, 4);
     *     let indices   = createAugmentedTypedArray(3, 2, Uint16Array);
     *
     *     positions.push([0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0]);
     *     texcoords.push([0, 0, 0, 1, 1, 0, 1, 1]);
     *     normals.push([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]);
     *     indices.push([0, 1, 2, 1, 2, 3]);
     *
     *     let arrays = {
     *        position: positions,
     *        texcoord: texcoords,
     *        normal:   normals,
     *        indices:  indices,
     *     };
     *
     * For the last example it is equivalent to
     *
     *     let bufferInfo = {
     *       attribs: {
     *         a_position: { numComponents: 3, buffer: gl.createBuffer(), },
     *         a_texcoods: { numComponents: 2, buffer: gl.createBuffer(), },
     *         a_normals: { numComponents: 3, buffer: gl.createBuffer(), },
     *       },
     *       indices: gl.createBuffer(),
     *       numElements: 6,
     *     };
     *
     *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_position.buffer);
     *     gl.bufferData(gl.ARRAY_BUFFER, arrays.position, gl.STATIC_DRAW);
     *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_texcoord.buffer);
     *     gl.bufferData(gl.ARRAY_BUFFER, arrays.texcoord, gl.STATIC_DRAW);
     *     gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_normal.buffer);
     *     gl.bufferData(gl.ARRAY_BUFFER, arrays.normal, gl.STATIC_DRAW);
     *     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufferInfo.indices);
     *     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, arrays.indices, gl.STATIC_DRAW);
     *
     * @param {WebGLRenderingContext} gl A WebGLRenderingContext
     * @param {Object.<string, array|object|typedarray>} arrays Your data
     * @param {Object.<string, string>} [opt_mapping] an optional mapping of attribute to array name.
     *    If not passed in it's assumed the array names will be mapped to an attribute
     *    of the same name with "a_" prefixed to it. An other words.
     *
     *        let arrays = {
     *           position: ...,
     *           texcoord: ...,
     *           normal:   ...,
     *           indices:  ...,
     *        };
     *
     *        bufferInfo = createBufferInfoFromArrays(gl, arrays);
     *
     *    Is the same as
     *
     *        let arrays = {
     *           position: ...,
     *           texcoord: ...,
     *           normal:   ...,
     *           indices:  ...,
     *        };
     *
     *        let mapping = {
     *          a_position: "position",
     *          a_texcoord: "texcoord",
     *          a_normal:   "normal",
     *        };
     *
     *        bufferInfo = createBufferInfoFromArrays(gl, arrays, mapping);
     *
     * @return {module:webgl-utils.BufferInfo} A BufferInfo
     * @memberOf module:webgl-utils
     */
    function createBufferInfoFromArrays(gl, arrays, opt_mapping) {
        const bufferInfo = {
            attribs: createAttribsFromArrays(gl, arrays, opt_mapping),
        };
        let indices = arrays.indices;
        if (indices) {
            indices = makeTypedArray(indices, 'indices');
            bufferInfo.indices = createBufferFromTypedArray(gl, indices, gl.ELEMENT_ARRAY_BUFFER);
            bufferInfo.numElements = indices.length;
        } else {
            bufferInfo.numElements = getNumElementsFromNonIndexedArrays(arrays);
        }

        return bufferInfo;
    }

    /**
     * Creates buffers from typed arrays
     *
     * Given something like this
     *
     *     let arrays = {
     *        positions: [1, 2, 3],
     *        normals: [0, 0, 1],
     *     }
     *
     * returns something like
     *
     *     buffers = {
     *       positions: WebGLBuffer,
     *       normals: WebGLBuffer,
     *     }
     *
     * If the buffer is named 'indices' it will be made an ELEMENT_ARRAY_BUFFER.
     *
     * @param {WebGLRenderingContext} gl A WebGLRenderingContext.
     * @param {Object<string, array|typedarray>} arrays
     * @return {Object<string, WebGLBuffer>} returns an object with one WebGLBuffer per array
     * @memberOf module:webgl-utils
     */
    function createBuffersFromArrays(gl, arrays) {
        const buffers = { };
        Object.keys(arrays).forEach(function(key) {
            const type = key === 'indices' ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;
            const array = makeTypedArray(arrays[key], name);
            buffers[key] = createBufferFromTypedArray(gl, array, type);
        });

        // hrm
        if (arrays.indices) {
            buffers.numElements = arrays.indices.length;
        } else if (arrays.position) {
            buffers.numElements = arrays.position.length / 3;
        }

        return buffers;
    }

    /**
     * Calls `gl.drawElements` or `gl.drawArrays`, whichever is appropriate
     *
     * normally you'd call `gl.drawElements` or `gl.drawArrays` yourself
     * but calling this means if you switch from indexed data to non-indexed
     * data you don't have to remember to update your draw call.
     *
     * @param {WebGLRenderingContext} gl A WebGLRenderingContext
     * @param {module:webgl-utils.BufferInfo} bufferInfo as returned from createBufferInfoFromArrays
     * @param {enum} [primitiveType] eg (gl.TRIANGLES, gl.LINES, gl.POINTS, gl.TRIANGLE_STRIP, ...)
     * @param {number} [count] An optional count. Defaults to bufferInfo.numElements
     * @param {number} [offset] An optional offset. Defaults to 0.
     * @memberOf module:webgl-utils
     */
    function drawBufferInfo(gl, bufferInfo, primitiveType, count, offset) {
        const indices = bufferInfo.indices;
        primitiveType = primitiveType === undefined ? gl.TRIANGLES : primitiveType;
        const numElements = count === undefined ? bufferInfo.numElements : count;
        offset = offset === undefined ? 0 : offset;
        if (indices) {
            gl.drawElements(primitiveType, numElements, gl.UNSIGNED_SHORT, offset);
        } else {
            gl.drawArrays(primitiveType, offset, numElements);
        }
    }

    /**
     * @typedef {Object} DrawObject
     * @property {module:webgl-utils.ProgramInfo} programInfo A ProgramInfo as returned from createProgramInfo
     * @property {module:webgl-utils.BufferInfo} bufferInfo A BufferInfo as returned from createBufferInfoFromArrays
     * @property {Object<string, ?>} uniforms The values for the uniforms
     * @memberOf module:webgl-utils
     */

    /**
     * Draws a list of objects
     * @param {WebGLRenderingContext} gl A WebGLRenderingContext
     * @param {DrawObject[]} objectsToDraw an array of objects to draw.
     * @memberOf module:webgl-utils
     */
    function drawObjectList(gl, objectsToDraw) {
        let lastUsedProgramInfo = null;
        let lastUsedBufferInfo = null;

        objectsToDraw.forEach(function(object) {
            const programInfo = object.programInfo;
            const bufferInfo = object.bufferInfo;
            let bindBuffers = false;

            if (programInfo !== lastUsedProgramInfo) {
                lastUsedProgramInfo = programInfo;
                gl.useProgram(programInfo.program);
                bindBuffers = true;
            }

            // Setup all the needed attributes.
            if (bindBuffers || bufferInfo !== lastUsedBufferInfo) {
                lastUsedBufferInfo = bufferInfo;
                setBuffersAndAttributes(gl, programInfo.attribSetters, bufferInfo);
            }

            // Set the uniforms.
            setUniforms(programInfo.uniformSetters, object.uniforms);

            // Draw
            drawBufferInfo(gl, bufferInfo);
        });
    }

    function glEnumToString(gl, v) {
        const results = [];
        for (const key in gl) {
            if (gl[key] === v) {
                results.push(key);
            }
        }
        return results.length
            ? results.join(' | ')
            : `0x${v.toString(16)}`;
    }

    const isIE = /*@cc_on!@*/false || !!document.documentMode;
    // Edge 20+
    const isEdge = !isIE && !!window.StyleMedia;
    if (isEdge) {
        // Hack for Edge. Edge's WebGL implmentation is crap still and so they
        // only respond to "experimental-webgl". I don't want to clutter the
        // examples with that so his hack works around it
        HTMLCanvasElement.prototype.getContext = function(origFn) {
            return function() {
                let args = arguments;
                const type = args[0];
                if (type === 'webgl') {
                    args = [].slice.call(arguments);
                    args[0] = 'experimental-webgl';
                }
                return origFn.apply(this, args);
            };
        }(HTMLCanvasElement.prototype.getContext);
    }

    return {
        createAugmentedTypedArray: createAugmentedTypedArray,
        createAttribsFromArrays: createAttribsFromArrays,
        createBuffersFromArrays: createBuffersFromArrays,
        createBufferInfoFromArrays: createBufferInfoFromArrays,
        createAttributeSetters: createAttributeSetters,
        createProgram: createProgram,
        createProgramFromScripts: createProgramFromScripts,
        createProgramFromSources: createProgramFromSources,
        createProgramInfo: createProgramInfo,
        createUniformSetters: createUniformSetters,
        createVAOAndSetAttributes: createVAOAndSetAttributes,
        createVAOFromBufferInfo: createVAOFromBufferInfo,
        drawBufferInfo: drawBufferInfo,
        drawObjectList: drawObjectList,
        glEnumToString: glEnumToString,
        getExtensionWithKnownPrefixes: getExtensionWithKnownPrefixes,
        resizeCanvasToDisplaySize: resizeCanvasToDisplaySize,
        setAttributes: setAttributes,
        setBuffersAndAttributes: setBuffersAndAttributes,
        setUniforms: setUniforms,
    };

}));

/*
 * WebGL m4 Utilities
 * ----------------------------------------------------------------------
 * Copyright 2014, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of his
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * Various 3d math functions.
 *
 * @module webgl-3d-math
 */
(function(root, factory) {  // eslint-disable-line
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        // Browser globals
        root.m4 = factory();
    }
}(this, function() {
    "use strict";

    /**
     * An array or typed array with 3 values.
     * @typedef {number[]|TypedArray} Vector3
     * @memberOf module:webgl-3d-math
     */

    /**
     * An array or typed array with 4 values.
     * @typedef {number[]|TypedArray} Vector4
     * @memberOf module:webgl-3d-math
     */

    /**
     * An array or typed array with 16 values.
     * @typedef {number[]|TypedArray} Matrix4
     * @memberOf module:webgl-3d-math
     */


    let MatType = Float32Array;

    /**
     * Sets the type this library creates for a Mat4
     * @param {constructor} Ctor the constructor for the type. Either `Float32Array` or `Array`
     * @return {constructor} previous constructor for Mat4
     */
    function setDefaultType(Ctor) {
        const OldType = MatType;
        MatType = Ctor;
        return OldType;
    }

    /**
     * Takes two 4-by-4 matrices, a and b, and computes the product in the order
     * that pre-composes b with a.  In other words, the matrix returned will
     * transform by b first and then a.  Note this is subtly different from just
     * multiplying the matrices together.  For given a and b, this function returns
     * the same object in both row-major and column-major mode.
     * @param {Matrix4} a A matrix.
     * @param {Matrix4} b A matrix.
     * @param {Matrix4} [dst] optional matrix to store result
     * @return {Matrix4} dst or a new matrix if none provided
     */
    function multiply(a, b, dst) {
        dst = dst || new MatType(16);
        var b00 = b[0 * 4 + 0];
        var b01 = b[0 * 4 + 1];
        var b02 = b[0 * 4 + 2];
        var b03 = b[0 * 4 + 3];
        var b10 = b[1 * 4 + 0];
        var b11 = b[1 * 4 + 1];
        var b12 = b[1 * 4 + 2];
        var b13 = b[1 * 4 + 3];
        var b20 = b[2 * 4 + 0];
        var b21 = b[2 * 4 + 1];
        var b22 = b[2 * 4 + 2];
        var b23 = b[2 * 4 + 3];
        var b30 = b[3 * 4 + 0];
        var b31 = b[3 * 4 + 1];
        var b32 = b[3 * 4 + 2];
        var b33 = b[3 * 4 + 3];
        var a00 = a[0 * 4 + 0];
        var a01 = a[0 * 4 + 1];
        var a02 = a[0 * 4 + 2];
        var a03 = a[0 * 4 + 3];
        var a10 = a[1 * 4 + 0];
        var a11 = a[1 * 4 + 1];
        var a12 = a[1 * 4 + 2];
        var a13 = a[1 * 4 + 3];
        var a20 = a[2 * 4 + 0];
        var a21 = a[2 * 4 + 1];
        var a22 = a[2 * 4 + 2];
        var a23 = a[2 * 4 + 3];
        var a30 = a[3 * 4 + 0];
        var a31 = a[3 * 4 + 1];
        var a32 = a[3 * 4 + 2];
        var a33 = a[3 * 4 + 3];
        dst[ 0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
        dst[ 1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
        dst[ 2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
        dst[ 3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;
        dst[ 4] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
        dst[ 5] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
        dst[ 6] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
        dst[ 7] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;
        dst[ 8] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
        dst[ 9] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
        dst[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
        dst[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;
        dst[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
        dst[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
        dst[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
        dst[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;
        return dst;
    }


    /**
     * adds 2 vectors3s
     * @param {Vector3} a a
     * @param {Vector3} b b
     * @param {Vector3} dst optional vector3 to store result
     * @return {Vector3} dst or new Vector3 if not provided
     * @memberOf module:webgl-3d-math
     */
    function addVectors(a, b, dst) {
        dst = dst || new MatType(3);
        dst[0] = a[0] + b[0];
        dst[1] = a[1] + b[1];
        dst[2] = a[2] + b[2];
        return dst;
    }

    /**
     * subtracts 2 vectors3s
     * @param {Vector3} a a
     * @param {Vector3} b b
     * @param {Vector3} dst optional vector3 to store result
     * @return {Vector3} dst or new Vector3 if not provided
     * @memberOf module:webgl-3d-math
     */
    function subtractVectors(a, b, dst) {
        dst = dst || new MatType(3);
        dst[0] = a[0] - b[0];
        dst[1] = a[1] - b[1];
        dst[2] = a[2] - b[2];
        return dst;
    }

    /**
     * scale vectors3
     * @param {Vector3} v vector
     * @param {Number} s scale
     * @param {Vector3} dst optional vector3 to store result
     * @return {Vector3} dst or new Vector3 if not provided
     * @memberOf module:webgl-3d-math
     */
    function scaleVector(v, s, dst) {
        dst = dst || new MatType(3);
        dst[0] = v[0] * s;
        dst[1] = v[1] * s;
        dst[2] = v[2] * s;
        return dst;
    }

    /**
     * normalizes a vector.
     * @param {Vector3} v vector to normalize
     * @param {Vector3} dst optional vector3 to store result
     * @return {Vector3} dst or new Vector3 if not provided
     * @memberOf module:webgl-3d-math
     */
    function normalize(v, dst) {
        dst = dst || new MatType(3);
        var length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        // make sure we don't divide by 0.
        if (length > 0.00001) {
            dst[0] = v[0] / length;
            dst[1] = v[1] / length;
            dst[2] = v[2] / length;
        }
        return dst;
    }

    /**
     * Computes the length of a vector
     * @param {Vector3} v vector to take length of
     * @return {number} length of vector
     */
    function length(v) {
        return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    }

    /**
     * Computes the length squared of a vector
     * @param {Vector3} v vector to take length of
     * @return {number} length sqaured of vector
     */
    function lengthSq(v) {
        return v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
    }

    /**
     * Computes the cross product of 2 vectors3s
     * @param {Vector3} a a
     * @param {Vector3} b b
     * @param {Vector3} dst optional vector3 to store result
     * @return {Vector3} dst or new Vector3 if not provided
     * @memberOf module:webgl-3d-math
     */
    function cross(a, b, dst) {
        dst = dst || new MatType(3);
        dst[0] = a[1] * b[2] - a[2] * b[1];
        dst[1] = a[2] * b[0] - a[0] * b[2];
        dst[2] = a[0] * b[1] - a[1] * b[0];
        return dst;
    }

    /**
     * Computes the dot product of two vectors; assumes both vectors have
     * three entries.
     * @param {Vector3} a Operand vector.
     * @param {Vector3} b Operand vector.
     * @return {number} dot product
     * @memberOf module:webgl-3d-math
     */
    function dot(a, b) {
        return (a[0] * b[0]) + (a[1] * b[1]) + (a[2] * b[2]);
    }

    /**
     * Computes the distance squared between 2 points
     * @param {Vector3} a
     * @param {Vector3} b
     * @return {number} distance squared between a and b
     */
    function distanceSq(a, b) {
        const dx = a[0] - b[0];
        const dy = a[1] - b[1];
        const dz = a[2] - b[2];
        return dx * dx + dy * dy + dz * dz;
    }

    /**
     * Computes the distance between 2 points
     * @param {Vector3} a
     * @param {Vector3} b
     * @return {number} distance between a and b
     */
    function distance(a, b) {
        return Math.sqrt(distanceSq(a, b));
    }

    /**
     * Makes an identity matrix.
     * @param {Matrix4} [dst] optional matrix to store result
     * @return {Matrix4} dst or a new matrix if none provided
     * @memberOf module:webgl-3d-math
     */
    function identity(dst) {
        dst = dst || new MatType(16);

        dst[ 0] = 1;
        dst[ 1] = 0;
        dst[ 2] = 0;
        dst[ 3] = 0;
        dst[ 4] = 0;
        dst[ 5] = 1;
        dst[ 6] = 0;
        dst[ 7] = 0;
        dst[ 8] = 0;
        dst[ 9] = 0;
        dst[10] = 1;
        dst[11] = 0;
        dst[12] = 0;
        dst[13] = 0;
        dst[14] = 0;
        dst[15] = 1;

        return dst;
    }

    /**
     * Transposes a matrix.
     * @param {Matrix4} m matrix to transpose.
     * @param {Matrix4} [dst] optional matrix to store result
     * @return {Matrix4} dst or a new matrix if none provided
     * @memberOf module:webgl-3d-math
     */
    function transpose(m, dst) {
        dst = dst || new MatType(16);

        dst[ 0] = m[0];
        dst[ 1] = m[4];
        dst[ 2] = m[8];
        dst[ 3] = m[12];
        dst[ 4] = m[1];
        dst[ 5] = m[5];
        dst[ 6] = m[9];
        dst[ 7] = m[13];
        dst[ 8] = m[2];
        dst[ 9] = m[6];
        dst[10] = m[10];
        dst[11] = m[14];
        dst[12] = m[3];
        dst[13] = m[7];
        dst[14] = m[11];
        dst[15] = m[15];

        return dst;
    }

    /**
     * Creates a lookAt matrix.
     * This is a world matrix for a camera. In other words it will transform
     * from the origin to a place and orientation in the world. For a view
     * matrix take the inverse of this.
     * @param {Vector3} cameraPosition position of the camera
     * @param {Vector3} target position of the target
     * @param {Vector3} up direction
     * @param {Matrix4} [dst] optional matrix to store result
     * @return {Matrix4} dst or a new matrix if none provided
     * @memberOf module:webgl-3d-math
     */
    function lookAt(cameraPosition, target, up, dst) {
        dst = dst || new MatType(16);
        var zAxis = normalize(
            subtractVectors(cameraPosition, target));
        var xAxis = normalize(cross(up, zAxis));
        var yAxis = normalize(cross(zAxis, xAxis));

        dst[ 0] = xAxis[0];
        dst[ 1] = xAxis[1];
        dst[ 2] = xAxis[2];
        dst[ 3] = 0;
        dst[ 4] = yAxis[0];
        dst[ 5] = yAxis[1];
        dst[ 6] = yAxis[2];
        dst[ 7] = 0;
        dst[ 8] = zAxis[0];
        dst[ 9] = zAxis[1];
        dst[10] = zAxis[2];
        dst[11] = 0;
        dst[12] = cameraPosition[0];
        dst[13] = cameraPosition[1];
        dst[14] = cameraPosition[2];
        dst[15] = 1;

        return dst;
    }

    /**
     * Computes a 4-by-4 perspective transformation matrix given the angular height
     * of the frustum, the aspect ratio, and the near and far clipping planes.  The
     * arguments define a frustum extending in the negative z direction.  The given
     * angle is the vertical angle of the frustum, and the horizontal angle is
     * determined to produce the given aspect ratio.  The arguments near and far are
     * the distances to the near and far clipping planes.  Note that near and far
     * are not z coordinates, but rather they are distances along the negative
     * z-axis.  The matrix generated sends the viewing frustum to the unit box.
     * We assume a unit box extending from -1 to 1 in the x and y dimensions and
     * from -1 to 1 in the z dimension.
     * @param {number} fieldOfViewInRadians field of view in y axis.
     * @param {number} aspect aspect of viewport (width / height)
     * @param {number} near near Z clipping plane
     * @param {number} far far Z clipping plane
     * @param {Matrix4} [dst] optional matrix to store result
     * @return {Matrix4} dst or a new matrix if none provided
     * @memberOf module:webgl-3d-math
     */
    function perspective(fieldOfViewInRadians, aspect, near, far, dst) {
        dst = dst || new MatType(16);
        var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
        var rangeInv = 1.0 / (near - far);

        dst[ 0] = f / aspect;
        dst[ 1] = 0;
        dst[ 2] = 0;
        dst[ 3] = 0;
        dst[ 4] = 0;
        dst[ 5] = f;
        dst[ 6] = 0;
        dst[ 7] = 0;
        dst[ 8] = 0;
        dst[ 9] = 0;
        dst[10] = (near + far) * rangeInv;
        dst[11] = -1;
        dst[12] = 0;
        dst[13] = 0;
        dst[14] = near * far * rangeInv * 2;
        dst[15] = 0;

        return dst;
    }

    /**
     * Computes a 4-by-4 orthographic projection matrix given the coordinates of the
     * planes defining the axis-aligned, box-shaped viewing volume.  The matrix
     * generated sends that box to the unit box.  Note that although left and right
     * are x coordinates and bottom and top are y coordinates, near and far
     * are not z coordinates, but rather they are distances along the negative
     * z-axis.  We assume a unit box extending from -1 to 1 in the x and y
     * dimensions and from -1 to 1 in the z dimension.
     * @param {number} left The x coordinate of the left plane of the box.
     * @param {number} right The x coordinate of the right plane of the box.
     * @param {number} bottom The y coordinate of the bottom plane of the box.
     * @param {number} top The y coordinate of the right plane of the box.
     * @param {number} near The negative z coordinate of the near plane of the box.
     * @param {number} far The negative z coordinate of the far plane of the box.
     * @param {Matrix4} [dst] optional matrix to store result
     * @return {Matrix4} dst or a new matrix if none provided
     * @memberOf module:webgl-3d-math
     */
    function orthographic(left, right, bottom, top, near, far, dst) {
        dst = dst || new MatType(16);

        dst[ 0] = 2 / (right - left);
        dst[ 1] = 0;
        dst[ 2] = 0;
        dst[ 3] = 0;
        dst[ 4] = 0;
        dst[ 5] = 2 / (top - bottom);
        dst[ 6] = 0;
        dst[ 7] = 0;
        dst[ 8] = 0;
        dst[ 9] = 0;
        dst[10] = 2 / (near - far);
        dst[11] = 0;
        dst[12] = (left + right) / (left - right);
        dst[13] = (bottom + top) / (bottom - top);
        dst[14] = (near + far) / (near - far);
        dst[15] = 1;

        return dst;
    }

    /**
     * Computes a 4-by-4 perspective transformation matrix given the left, right,
     * top, bottom, near and far clipping planes. The arguments define a frustum
     * extending in the negative z direction. The arguments near and far are the
     * distances to the near and far clipping planes. Note that near and far are not
     * z coordinates, but rather they are distances along the negative z-axis. The
     * matrix generated sends the viewing frustum to the unit box. We assume a unit
     * box extending from -1 to 1 in the x and y dimensions and from -1 to 1 in the z
     * dimension.
     * @param {number} left The x coordinate of the left plane of the box.
     * @param {number} right The x coordinate of the right plane of the box.
     * @param {number} bottom The y coordinate of the bottom plane of the box.
     * @param {number} top The y coordinate of the right plane of the box.
     * @param {number} near The negative z coordinate of the near plane of the box.
     * @param {number} far The negative z coordinate of the far plane of the box.
     * @param {Matrix4} [dst] optional matrix to store result
     * @return {Matrix4} dst or a new matrix if none provided
     * @memberOf module:webgl-3d-math
     */
    function frustum(left, right, bottom, top, near, far, dst) {
        dst = dst || new MatType(16);

        var dx = right - left;
        var dy = top - bottom;
        var dz = far - near;

        dst[ 0] = 2 * near / dx;
        dst[ 1] = 0;
        dst[ 2] = 0;
        dst[ 3] = 0;
        dst[ 4] = 0;
        dst[ 5] = 2 * near / dy;
        dst[ 6] = 0;
        dst[ 7] = 0;
        dst[ 8] = (left + right) / dx;
        dst[ 9] = (top + bottom) / dy;
        dst[10] = -(far + near) / dz;
        dst[11] = -1;
        dst[12] = 0;
        dst[13] = 0;
        dst[14] = -2 * near * far / dz;
        dst[15] = 0;

        return dst;
    }

    /**
     * Makes a translation matrix
     * @param {number} tx x translation.
     * @param {number} ty y translation.
     * @param {number} tz z translation.
     * @param {Matrix4} [dst] optional matrix to store result
     * @return {Matrix4} dst or a new matrix if none provided
     * @memberOf module:webgl-3d-math
     */
    function translation(tx, ty, tz, dst) {
        dst = dst || new MatType(16);

        dst[ 0] = 1;
        dst[ 1] = 0;
        dst[ 2] = 0;
        dst[ 3] = 0;
        dst[ 4] = 0;
        dst[ 5] = 1;
        dst[ 6] = 0;
        dst[ 7] = 0;
        dst[ 8] = 0;
        dst[ 9] = 0;
        dst[10] = 1;
        dst[11] = 0;
        dst[12] = tx;
        dst[13] = ty;
        dst[14] = tz;
        dst[15] = 1;

        return dst;
    }

    /**
     * Multiply by translation matrix.
     * @param {Matrix4} m matrix to multiply
     * @param {number} tx x translation.
     * @param {number} ty y translation.
     * @param {number} tz z translation.
     * @param {Matrix4} [dst] optional matrix to store result
     * @return {Matrix4} dst or a new matrix if none provided
     * @memberOf module:webgl-3d-math
     */
    function translate(m, tx, ty, tz, dst) {
        // This is the optimized version of
        // return multiply(m, translation(tx, ty, tz), dst);
        dst = dst || new MatType(16);

        var m00 = m[0];
        var m01 = m[1];
        var m02 = m[2];
        var m03 = m[3];
        var m10 = m[1 * 4 + 0];
        var m11 = m[1 * 4 + 1];
        var m12 = m[1 * 4 + 2];
        var m13 = m[1 * 4 + 3];
        var m20 = m[2 * 4 + 0];
        var m21 = m[2 * 4 + 1];
        var m22 = m[2 * 4 + 2];
        var m23 = m[2 * 4 + 3];
        var m30 = m[3 * 4 + 0];
        var m31 = m[3 * 4 + 1];
        var m32 = m[3 * 4 + 2];
        var m33 = m[3 * 4 + 3];

        if (m !== dst) {
            dst[ 0] = m00;
            dst[ 1] = m01;
            dst[ 2] = m02;
            dst[ 3] = m03;
            dst[ 4] = m10;
            dst[ 5] = m11;
            dst[ 6] = m12;
            dst[ 7] = m13;
            dst[ 8] = m20;
            dst[ 9] = m21;
            dst[10] = m22;
            dst[11] = m23;
        }

        dst[12] = m00 * tx + m10 * ty + m20 * tz + m30;
        dst[13] = m01 * tx + m11 * ty + m21 * tz + m31;
        dst[14] = m02 * tx + m12 * ty + m22 * tz + m32;
        dst[15] = m03 * tx + m13 * ty + m23 * tz + m33;

        return dst;
    }

    /**
     * Makes an x rotation matrix
     * @param {number} angleInRadians amount to rotate
     * @param {Matrix4} [dst] optional matrix to store result
     * @return {Matrix4} dst or a new matrix if none provided
     * @memberOf module:webgl-3d-math
     */
    function xRotation(angleInRadians, dst) {
        dst = dst || new MatType(16);
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        dst[ 0] = 1;
        dst[ 1] = 0;
        dst[ 2] = 0;
        dst[ 3] = 0;
        dst[ 4] = 0;
        dst[ 5] = c;
        dst[ 6] = s;
        dst[ 7] = 0;
        dst[ 8] = 0;
        dst[ 9] = -s;
        dst[10] = c;
        dst[11] = 0;
        dst[12] = 0;
        dst[13] = 0;
        dst[14] = 0;
        dst[15] = 1;

        return dst;
    }

    /**
     * Multiply by an x rotation matrix
     * @param {Matrix4} m matrix to multiply
     * @param {number} angleInRadians amount to rotate
     * @param {Matrix4} [dst] optional matrix to store result
     * @return {Matrix4} dst or a new matrix if none provided
     * @memberOf module:webgl-3d-math
     */
    function xRotate(m, angleInRadians, dst) {
        // this is the optimized version of
        // return multiply(m, xRotation(angleInRadians), dst);
        dst = dst || new MatType(16);

        var m10 = m[4];
        var m11 = m[5];
        var m12 = m[6];
        var m13 = m[7];
        var m20 = m[8];
        var m21 = m[9];
        var m22 = m[10];
        var m23 = m[11];
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        dst[4]  = c * m10 + s * m20;
        dst[5]  = c * m11 + s * m21;
        dst[6]  = c * m12 + s * m22;
        dst[7]  = c * m13 + s * m23;
        dst[8]  = c * m20 - s * m10;
        dst[9]  = c * m21 - s * m11;
        dst[10] = c * m22 - s * m12;
        dst[11] = c * m23 - s * m13;

        if (m !== dst) {
            dst[ 0] = m[ 0];
            dst[ 1] = m[ 1];
            dst[ 2] = m[ 2];
            dst[ 3] = m[ 3];
            dst[12] = m[12];
            dst[13] = m[13];
            dst[14] = m[14];
            dst[15] = m[15];
        }

        return dst;
    }

    /**
     * Makes an y rotation matrix
     * @param {number} angleInRadians amount to rotate
     * @param {Matrix4} [dst] optional matrix to store result
     * @return {Matrix4} dst or a new matrix if none provided
     * @memberOf module:webgl-3d-math
     */
    function yRotation(angleInRadians, dst) {
        dst = dst || new MatType(16);
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        dst[ 0] = c;
        dst[ 1] = 0;
        dst[ 2] = -s;
        dst[ 3] = 0;
        dst[ 4] = 0;
        dst[ 5] = 1;
        dst[ 6] = 0;
        dst[ 7] = 0;
        dst[ 8] = s;
        dst[ 9] = 0;
        dst[10] = c;
        dst[11] = 0;
        dst[12] = 0;
        dst[13] = 0;
        dst[14] = 0;
        dst[15] = 1;

        return dst;
    }

    /**
     * Multiply by an y rotation matrix
     * @param {Matrix4} m matrix to multiply
     * @param {number} angleInRadians amount to rotate
     * @param {Matrix4} [dst] optional matrix to store result
     * @return {Matrix4} dst or a new matrix if none provided
     * @memberOf module:webgl-3d-math
     */
    function yRotate(m, angleInRadians, dst) {
        // this is the optimized version of
        // return multiply(m, yRotation(angleInRadians), dst);
        dst = dst || new MatType(16);

        var m00 = m[0 * 4 + 0];
        var m01 = m[0 * 4 + 1];
        var m02 = m[0 * 4 + 2];
        var m03 = m[0 * 4 + 3];
        var m20 = m[2 * 4 + 0];
        var m21 = m[2 * 4 + 1];
        var m22 = m[2 * 4 + 2];
        var m23 = m[2 * 4 + 3];
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        dst[ 0] = c * m00 - s * m20;
        dst[ 1] = c * m01 - s * m21;
        dst[ 2] = c * m02 - s * m22;
        dst[ 3] = c * m03 - s * m23;
        dst[ 8] = c * m20 + s * m00;
        dst[ 9] = c * m21 + s * m01;
        dst[10] = c * m22 + s * m02;
        dst[11] = c * m23 + s * m03;

        if (m !== dst) {
            dst[ 4] = m[ 4];
            dst[ 5] = m[ 5];
            dst[ 6] = m[ 6];
            dst[ 7] = m[ 7];
            dst[12] = m[12];
            dst[13] = m[13];
            dst[14] = m[14];
            dst[15] = m[15];
        }

        return dst;
    }

    /**
     * Makes an z rotation matrix
     * @param {number} angleInRadians amount to rotate
     * @param {Matrix4} [dst] optional matrix to store result
     * @return {Matrix4} dst or a new matrix if none provided
     * @memberOf module:webgl-3d-math
     */
    function zRotation(angleInRadians, dst) {
        dst = dst || new MatType(16);
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        dst[ 0] = c;
        dst[ 1] = s;
        dst[ 2] = 0;
        dst[ 3] = 0;
        dst[ 4] = -s;
        dst[ 5] = c;
        dst[ 6] = 0;
        dst[ 7] = 0;
        dst[ 8] = 0;
        dst[ 9] = 0;
        dst[10] = 1;
        dst[11] = 0;
        dst[12] = 0;
        dst[13] = 0;
        dst[14] = 0;
        dst[15] = 1;

        return dst;
    }

    /**
     * Multiply by an z rotation matrix
     * @param {Matrix4} m matrix to multiply
     * @param {number} angleInRadians amount to rotate
     * @param {Matrix4} [dst] optional matrix to store result
     * @return {Matrix4} dst or a new matrix if none provided
     * @memberOf module:webgl-3d-math
     */
    function zRotate(m, angleInRadians, dst) {
        // This is the optimized version of
        // return multiply(m, zRotation(angleInRadians), dst);
        dst = dst || new MatType(16);

        var m00 = m[0 * 4 + 0];
        var m01 = m[0 * 4 + 1];
        var m02 = m[0 * 4 + 2];
        var m03 = m[0 * 4 + 3];
        var m10 = m[1 * 4 + 0];
        var m11 = m[1 * 4 + 1];
        var m12 = m[1 * 4 + 2];
        var m13 = m[1 * 4 + 3];
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        dst[ 0] = c * m00 + s * m10;
        dst[ 1] = c * m01 + s * m11;
        dst[ 2] = c * m02 + s * m12;
        dst[ 3] = c * m03 + s * m13;
        dst[ 4] = c * m10 - s * m00;
        dst[ 5] = c * m11 - s * m01;
        dst[ 6] = c * m12 - s * m02;
        dst[ 7] = c * m13 - s * m03;

        if (m !== dst) {
            dst[ 8] = m[ 8];
            dst[ 9] = m[ 9];
            dst[10] = m[10];
            dst[11] = m[11];
            dst[12] = m[12];
            dst[13] = m[13];
            dst[14] = m[14];
            dst[15] = m[15];
        }

        return dst;
    }

    /**
     * Makes an rotation matrix around an arbitrary axis
     * @param {Vector3} axis axis to rotate around
     * @param {number} angleInRadians amount to rotate
     * @param {Matrix4} [dst] optional matrix to store result
     * @return {Matrix4} dst or a new matrix if none provided
     * @memberOf module:webgl-3d-math
     */
    function axisRotation(axis, angleInRadians, dst) {
        dst = dst || new MatType(16);

        var x = axis[0];
        var y = axis[1];
        var z = axis[2];
        var n = Math.sqrt(x * x + y * y + z * z);
        x /= n;
        y /= n;
        z /= n;
        var xx = x * x;
        var yy = y * y;
        var zz = z * z;
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
        var oneMinusCosine = 1 - c;

        dst[ 0] = xx + (1 - xx) * c;
        dst[ 1] = x * y * oneMinusCosine + z * s;
        dst[ 2] = x * z * oneMinusCosine - y * s;
        dst[ 3] = 0;
        dst[ 4] = x * y * oneMinusCosine - z * s;
        dst[ 5] = yy + (1 - yy) * c;
        dst[ 6] = y * z * oneMinusCosine + x * s;
        dst[ 7] = 0;
        dst[ 8] = x * z * oneMinusCosine + y * s;
        dst[ 9] = y * z * oneMinusCosine - x * s;
        dst[10] = zz + (1 - zz) * c;
        dst[11] = 0;
        dst[12] = 0;
        dst[13] = 0;
        dst[14] = 0;
        dst[15] = 1;

        return dst;
    }

    /**
     * Multiply by an axis rotation matrix
     * @param {Matrix4} m matrix to multiply
     * @param {Vector3} axis axis to rotate around
     * @param {number} angleInRadians amount to rotate
     * @param {Matrix4} [dst] optional matrix to store result
     * @return {Matrix4} dst or a new matrix if none provided
     * @memberOf module:webgl-3d-math
     */
    function axisRotate(m, axis, angleInRadians, dst) {
        // This is the optimized version of
        // return multiply(m, axisRotation(axis, angleInRadians), dst);
        dst = dst || new MatType(16);

        var x = axis[0];
        var y = axis[1];
        var z = axis[2];
        var n = Math.sqrt(x * x + y * y + z * z);
        x /= n;
        y /= n;
        z /= n;
        var xx = x * x;
        var yy = y * y;
        var zz = z * z;
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
        var oneMinusCosine = 1 - c;

        var r00 = xx + (1 - xx) * c;
        var r01 = x * y * oneMinusCosine + z * s;
        var r02 = x * z * oneMinusCosine - y * s;
        var r10 = x * y * oneMinusCosine - z * s;
        var r11 = yy + (1 - yy) * c;
        var r12 = y * z * oneMinusCosine + x * s;
        var r20 = x * z * oneMinusCosine + y * s;
        var r21 = y * z * oneMinusCosine - x * s;
        var r22 = zz + (1 - zz) * c;

        var m00 = m[0];
        var m01 = m[1];
        var m02 = m[2];
        var m03 = m[3];
        var m10 = m[4];
        var m11 = m[5];
        var m12 = m[6];
        var m13 = m[7];
        var m20 = m[8];
        var m21 = m[9];
        var m22 = m[10];
        var m23 = m[11];

        dst[ 0] = r00 * m00 + r01 * m10 + r02 * m20;
        dst[ 1] = r00 * m01 + r01 * m11 + r02 * m21;
        dst[ 2] = r00 * m02 + r01 * m12 + r02 * m22;
        dst[ 3] = r00 * m03 + r01 * m13 + r02 * m23;
        dst[ 4] = r10 * m00 + r11 * m10 + r12 * m20;
        dst[ 5] = r10 * m01 + r11 * m11 + r12 * m21;
        dst[ 6] = r10 * m02 + r11 * m12 + r12 * m22;
        dst[ 7] = r10 * m03 + r11 * m13 + r12 * m23;
        dst[ 8] = r20 * m00 + r21 * m10 + r22 * m20;
        dst[ 9] = r20 * m01 + r21 * m11 + r22 * m21;
        dst[10] = r20 * m02 + r21 * m12 + r22 * m22;
        dst[11] = r20 * m03 + r21 * m13 + r22 * m23;

        if (m !== dst) {
            dst[12] = m[12];
            dst[13] = m[13];
            dst[14] = m[14];
            dst[15] = m[15];
        }

        return dst;
    }

    /**
     * Makes a scale matrix
     * @param {number} sx x scale.
     * @param {number} sy y scale.
     * @param {number} sz z scale.
     * @param {Matrix4} [dst] optional matrix to store result
     * @return {Matrix4} dst or a new matrix if none provided
     * @memberOf module:webgl-3d-math
     */
    function scaling(sx, sy, sz, dst) {
        dst = dst || new MatType(16);

        dst[ 0] = sx;
        dst[ 1] = 0;
        dst[ 2] = 0;
        dst[ 3] = 0;
        dst[ 4] = 0;
        dst[ 5] = sy;
        dst[ 6] = 0;
        dst[ 7] = 0;
        dst[ 8] = 0;
        dst[ 9] = 0;
        dst[10] = sz;
        dst[11] = 0;
        dst[12] = 0;
        dst[13] = 0;
        dst[14] = 0;
        dst[15] = 1;

        return dst;
    }

    /**
     * Multiply by a scaling matrix
     * @param {Matrix4} m matrix to multiply
     * @param {number} sx x scale.
     * @param {number} sy y scale.
     * @param {number} sz z scale.
     * @param {Matrix4} [dst] optional matrix to store result
     * @return {Matrix4} dst or a new matrix if none provided
     * @memberOf module:webgl-3d-math
     */
    function scale(m, sx, sy, sz, dst) {
        // This is the optimized version of
        // return multiply(m, scaling(sx, sy, sz), dst);
        dst = dst || new MatType(16);

        dst[ 0] = sx * m[0 * 4 + 0];
        dst[ 1] = sx * m[0 * 4 + 1];
        dst[ 2] = sx * m[0 * 4 + 2];
        dst[ 3] = sx * m[0 * 4 + 3];
        dst[ 4] = sy * m[1 * 4 + 0];
        dst[ 5] = sy * m[1 * 4 + 1];
        dst[ 6] = sy * m[1 * 4 + 2];
        dst[ 7] = sy * m[1 * 4 + 3];
        dst[ 8] = sz * m[2 * 4 + 0];
        dst[ 9] = sz * m[2 * 4 + 1];
        dst[10] = sz * m[2 * 4 + 2];
        dst[11] = sz * m[2 * 4 + 3];

        if (m !== dst) {
            dst[12] = m[12];
            dst[13] = m[13];
            dst[14] = m[14];
            dst[15] = m[15];
        }

        return dst;
    }

    /**
     * creates a matrix from translation, quaternion, scale
     * @param {Number[]} translation [x, y, z] translation
     * @param {Number[]} quaternion [x, y, z, z] quaternion rotation
     * @param {Number[]} scale [x, y, z] scale
     * @param {Matrix4} [dst] optional matrix to store result
     * @return {Matrix4} dst or a new matrix if none provided
     */
    function compose(translation, quaternion, scale, dst) {
        dst = dst || new MatType(16);

        const x = quaternion[0];
        const y = quaternion[1];
        const z = quaternion[2];
        const w = quaternion[3];

        const x2 = x + x;
        const y2 = y + y;
        const z2 = z + z;

        const xx = x * x2;
        const xy = x * y2;
        const xz = x * z2;

        const yy = y * y2;
        const yz = y * z2;
        const zz = z * z2;

        const wx = w * x2;
        const wy = w * y2;
        const wz = w * z2;

        const sx = scale[0];
        const sy = scale[1];
        const sz = scale[2];

        dst[0] = (1 - (yy + zz)) * sx;
        dst[1] = (xy + wz) * sx;
        dst[2] = (xz - wy) * sx;
        dst[3] = 0;

        dst[4] = (xy - wz) * sy;
        dst[5] = (1 - (xx + zz)) * sy;
        dst[6] = (yz + wx) * sy;
        dst[7] = 0;

        dst[ 8] = (xz + wy) * sz;
        dst[ 9] = (yz - wx) * sz;
        dst[10] = (1 - (xx + yy)) * sz;
        dst[11] = 0;

        dst[12] = translation[0];
        dst[13] = translation[1];
        dst[14] = translation[2];
        dst[15] = 1;

        return dst;
    }

    function quatFromRotationMatrix(m, dst) {
        // http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm

        // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)
        const m11 = m[0];
        const m12 = m[4];
        const m13 = m[8];
        const m21 = m[1];
        const m22 = m[5];
        const m23 = m[9];
        const m31 = m[2];
        const m32 = m[6];
        const m33 = m[10];

        const trace = m11 + m22 + m33;

        if (trace > 0) {
            const s = 0.5 / Math.sqrt(trace + 1);
            dst[3] = 0.25 / s;
            dst[0] = (m32 - m23) * s;
            dst[1] = (m13 - m31) * s;
            dst[2] = (m21 - m12) * s;
        } else if (m11 > m22 && m11 > m33) {
            const s = 2 * Math.sqrt(1 + m11 - m22 - m33);
            dst[3] = (m32 - m23) / s;
            dst[0] = 0.25 * s;
            dst[1] = (m12 + m21) / s;
            dst[2] = (m13 + m31) / s;
        } else if (m22 > m33) {
            const s = 2 * Math.sqrt(1 + m22 - m11 - m33);
            dst[3] = (m13 - m31) / s;
            dst[0] = (m12 + m21) / s;
            dst[1] = 0.25 * s;
            dst[2] = (m23 + m32) / s;
        } else {
            const s = 2 * Math.sqrt(1 + m33 - m11 - m22);
            dst[3] = (m21 - m12) / s;
            dst[0] = (m13 + m31) / s;
            dst[1] = (m23 + m32) / s;
            dst[2] = 0.25 * s;
        }
    }

    function decompose(mat, translation, quaternion, scale) {
        let sx = m4.length(mat.slice(0, 3));
        const sy = m4.length(mat.slice(4, 7));
        const sz = m4.length(mat.slice(8, 11));

        // if determinate is negative, we need to invert one scale
        const det = determinate(mat);
        if (det < 0) {
            sx = -sx;
        }

        translation[0] = mat[12];
        translation[1] = mat[13];
        translation[2] = mat[14];

        // scale the rotation part
        const matrix = m4.copy(mat);

        const invSX = 1 / sx;
        const invSY = 1 / sy;
        const invSZ = 1 / sz;

        matrix[0] *= invSX;
        matrix[1] *= invSX;
        matrix[2] *= invSX;

        matrix[4] *= invSY;
        matrix[5] *= invSY;
        matrix[6] *= invSY;

        matrix[8] *= invSZ;
        matrix[9] *= invSZ;
        matrix[10] *= invSZ;

        quatFromRotationMatrix(matrix, quaternion);

        scale[0] = sx;
        scale[1] = sy;
        scale[2] = sz;
    }

    function determinate(m) {
        var m00 = m[0 * 4 + 0];
        var m01 = m[0 * 4 + 1];
        var m02 = m[0 * 4 + 2];
        var m03 = m[0 * 4 + 3];
        var m10 = m[1 * 4 + 0];
        var m11 = m[1 * 4 + 1];
        var m12 = m[1 * 4 + 2];
        var m13 = m[1 * 4 + 3];
        var m20 = m[2 * 4 + 0];
        var m21 = m[2 * 4 + 1];
        var m22 = m[2 * 4 + 2];
        var m23 = m[2 * 4 + 3];
        var m30 = m[3 * 4 + 0];
        var m31 = m[3 * 4 + 1];
        var m32 = m[3 * 4 + 2];
        var m33 = m[3 * 4 + 3];
        var tmp_0  = m22 * m33;
        var tmp_1  = m32 * m23;
        var tmp_2  = m12 * m33;
        var tmp_3  = m32 * m13;
        var tmp_4  = m12 * m23;
        var tmp_5  = m22 * m13;
        var tmp_6  = m02 * m33;
        var tmp_7  = m32 * m03;
        var tmp_8  = m02 * m23;
        var tmp_9  = m22 * m03;
        var tmp_10 = m02 * m13;
        var tmp_11 = m12 * m03;

        var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
            (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
        var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
            (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
        var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
            (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
        var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
            (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

        return 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);
    }

    /**
     * Computes the inverse of a matrix.
     * @param {Matrix4} m matrix to compute inverse of
     * @param {Matrix4} [dst] optional matrix to store result
     * @return {Matrix4} dst or a new matrix if none provided
     * @memberOf module:webgl-3d-math
     */
    function inverse(m, dst) {
        dst = dst || new MatType(16);
        var m00 = m[0 * 4 + 0];
        var m01 = m[0 * 4 + 1];
        var m02 = m[0 * 4 + 2];
        var m03 = m[0 * 4 + 3];
        var m10 = m[1 * 4 + 0];
        var m11 = m[1 * 4 + 1];
        var m12 = m[1 * 4 + 2];
        var m13 = m[1 * 4 + 3];
        var m20 = m[2 * 4 + 0];
        var m21 = m[2 * 4 + 1];
        var m22 = m[2 * 4 + 2];
        var m23 = m[2 * 4 + 3];
        var m30 = m[3 * 4 + 0];
        var m31 = m[3 * 4 + 1];
        var m32 = m[3 * 4 + 2];
        var m33 = m[3 * 4 + 3];
        var tmp_0  = m22 * m33;
        var tmp_1  = m32 * m23;
        var tmp_2  = m12 * m33;
        var tmp_3  = m32 * m13;
        var tmp_4  = m12 * m23;
        var tmp_5  = m22 * m13;
        var tmp_6  = m02 * m33;
        var tmp_7  = m32 * m03;
        var tmp_8  = m02 * m23;
        var tmp_9  = m22 * m03;
        var tmp_10 = m02 * m13;
        var tmp_11 = m12 * m03;
        var tmp_12 = m20 * m31;
        var tmp_13 = m30 * m21;
        var tmp_14 = m10 * m31;
        var tmp_15 = m30 * m11;
        var tmp_16 = m10 * m21;
        var tmp_17 = m20 * m11;
        var tmp_18 = m00 * m31;
        var tmp_19 = m30 * m01;
        var tmp_20 = m00 * m21;
        var tmp_21 = m20 * m01;
        var tmp_22 = m00 * m11;
        var tmp_23 = m10 * m01;

        var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
            (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
        var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
            (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
        var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
            (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
        var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
            (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

        var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

        dst[0] = d * t0;
        dst[1] = d * t1;
        dst[2] = d * t2;
        dst[3] = d * t3;
        dst[4] = d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
            (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30));
        dst[5] = d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
            (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30));
        dst[6] = d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
            (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30));
        dst[7] = d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
            (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20));
        dst[8] = d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
            (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33));
        dst[9] = d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
            (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33));
        dst[10] = d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
            (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33));
        dst[11] = d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
            (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23));
        dst[12] = d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
            (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22));
        dst[13] = d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
            (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02));
        dst[14] = d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
            (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12));
        dst[15] = d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
            (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02));

        return dst;
    }

    /**
     * Takes a  matrix and a vector with 4 entries, transforms that vector by
     * the matrix, and returns the result as a vector with 4 entries.
     * @param {Matrix4} m The matrix.
     * @param {Vector4} v The point in homogenous coordinates.
     * @param {Vector4} dst optional vector4 to store result
     * @return {Vector4} dst or new Vector4 if not provided
     * @memberOf module:webgl-3d-math
     */
    function transformVector(m, v, dst) {
        dst = dst || new MatType(4);
        for (var i = 0; i < 4; ++i) {
            dst[i] = 0.0;
            for (var j = 0; j < 4; ++j) {
                dst[i] += v[j] * m[j * 4 + i];
            }
        }
        return dst;
    }

    /**
     * Takes a 4-by-4 matrix and a vector with 3 entries,
     * interprets the vector as a point, transforms that point by the matrix, and
     * returns the result as a vector with 3 entries.
     * @param {Matrix4} m The matrix.
     * @param {Vector3} v The point.
     * @param {Vector4} dst optional vector4 to store result
     * @return {Vector4} dst or new Vector4 if not provided
     * @memberOf module:webgl-3d-math
     */
    function transformPoint(m, v, dst) {
        dst = dst || new MatType(3);
        var v0 = v[0];
        var v1 = v[1];
        var v2 = v[2];
        var d = v0 * m[0 * 4 + 3] + v1 * m[1 * 4 + 3] + v2 * m[2 * 4 + 3] + m[3 * 4 + 3];

        dst[0] = (v0 * m[0 * 4 + 0] + v1 * m[1 * 4 + 0] + v2 * m[2 * 4 + 0] + m[3 * 4 + 0]) / d;
        dst[1] = (v0 * m[0 * 4 + 1] + v1 * m[1 * 4 + 1] + v2 * m[2 * 4 + 1] + m[3 * 4 + 1]) / d;
        dst[2] = (v0 * m[0 * 4 + 2] + v1 * m[1 * 4 + 2] + v2 * m[2 * 4 + 2] + m[3 * 4 + 2]) / d;

        return dst;
    }

    /**
     * Takes a 4-by-4 matrix and a vector with 3 entries, interprets the vector as a
     * direction, transforms that direction by the matrix, and returns the result;
     * assumes the transformation of 3-dimensional space represented by the matrix
     * is parallel-preserving, i.e. any combination of rotation, scaling and
     * translation, but not a perspective distortion. Returns a vector with 3
     * entries.
     * @param {Matrix4} m The matrix.
     * @param {Vector3} v The direction.
     * @param {Vector4} dst optional vector4 to store result
     * @return {Vector4} dst or new Vector4 if not provided
     * @memberOf module:webgl-3d-math
     */
    function transformDirection(m, v, dst) {
        dst = dst || new MatType(3);

        var v0 = v[0];
        var v1 = v[1];
        var v2 = v[2];

        dst[0] = v0 * m[0 * 4 + 0] + v1 * m[1 * 4 + 0] + v2 * m[2 * 4 + 0];
        dst[1] = v0 * m[0 * 4 + 1] + v1 * m[1 * 4 + 1] + v2 * m[2 * 4 + 1];
        dst[2] = v0 * m[0 * 4 + 2] + v1 * m[1 * 4 + 2] + v2 * m[2 * 4 + 2];

        return dst;
    }

    /**
     * Takes a 4-by-4 matrix m and a vector v with 3 entries, interprets the vector
     * as a normal to a surface, and computes a vector which is normal upon
     * transforming that surface by the matrix. The effect of this function is the
     * same as transforming v (as a direction) by the inverse-transpose of m.  This
     * function assumes the transformation of 3-dimensional space represented by the
     * matrix is parallel-preserving, i.e. any combination of rotation, scaling and
     * translation, but not a perspective distortion.  Returns a vector with 3
     * entries.
     * @param {Matrix4} m The matrix.
     * @param {Vector3} v The normal.
     * @param {Vector3} [dst] The direction.
     * @return {Vector3} The transformed direction.
     * @memberOf module:webgl-3d-math
     */
    function transformNormal(m, v, dst) {
        dst = dst || new MatType(3);
        var mi = inverse(m);
        var v0 = v[0];
        var v1 = v[1];
        var v2 = v[2];

        dst[0] = v0 * mi[0 * 4 + 0] + v1 * mi[0 * 4 + 1] + v2 * mi[0 * 4 + 2];
        dst[1] = v0 * mi[1 * 4 + 0] + v1 * mi[1 * 4 + 1] + v2 * mi[1 * 4 + 2];
        dst[2] = v0 * mi[2 * 4 + 0] + v1 * mi[2 * 4 + 1] + v2 * mi[2 * 4 + 2];

        return dst;
    }

    function copy(src, dst) {
        dst = dst || new MatType(16);

        dst[ 0] = src[ 0];
        dst[ 1] = src[ 1];
        dst[ 2] = src[ 2];
        dst[ 3] = src[ 3];
        dst[ 4] = src[ 4];
        dst[ 5] = src[ 5];
        dst[ 6] = src[ 6];
        dst[ 7] = src[ 7];
        dst[ 8] = src[ 8];
        dst[ 9] = src[ 9];
        dst[10] = src[10];
        dst[11] = src[11];
        dst[12] = src[12];
        dst[13] = src[13];
        dst[14] = src[14];
        dst[15] = src[15];

        return dst;
    }

    return {
        copy: copy,
        lookAt: lookAt,
        addVectors: addVectors,
        subtractVectors: subtractVectors,
        scaleVector: scaleVector,
        distance: distance,
        distanceSq: distanceSq,
        normalize: normalize,
        compose: compose,
        cross: cross,
        decompose: decompose,
        dot: dot,
        identity: identity,
        transpose: transpose,
        length: length,
        lengthSq: lengthSq,
        orthographic: orthographic,
        frustum: frustum,
        perspective: perspective,
        translation: translation,
        translate: translate,
        xRotation: xRotation,
        yRotation: yRotation,
        zRotation: zRotation,
        xRotate: xRotate,
        yRotate: yRotate,
        zRotate: zRotate,
        axisRotation: axisRotation,
        axisRotate: axisRotate,
        scaling: scaling,
        scale: scale,
        multiply: multiply,
        inverse: inverse,
        transformVector: transformVector,
        transformPoint: transformPoint,
        transformDirection: transformDirection,
        transformNormal: transformNormal,
        setDefaultType: setDefaultType,
    };

}));

// Leaflet CanvasLayer
// -- L.DomUtil.setTransform from leaflet 1.0.0 to work on 0.0.7
//------------------------------------------------------------------------------
L.DomUtil.setTransform = L.DomUtil.setTransform || function (el, offset, scale) {
    var pos = offset || new L.Point(0, 0);

    el.style[L.DomUtil.TRANSFORM] =
        (L.Browser.ie3d ?
            'translate(' + pos.x + 'px,' + pos.y + 'px)' :
            'translate3d(' + pos.x + 'px,' + pos.y + 'px,0)') +
        (scale ? ' scale(' + scale + ')' : '');
};

// -- support for both  0.0.7 and 1.0.0 rc2 leaflet
L.CanvasLayer = (L.Layer ? L.Layer : L.Class).extend({
    // -- initialized is called on prototype
    initialize: function (options) {
        this._map = null;
        this._canvas = null;
        this._frame = null;
        this._delegate = null;
        L.setOptions(this, options);
    },

    delegate: function (del) {
        this._delegate = del;
        return this;
    },

    needRedraw: function () {
        if (!this._frame) {
            this._frame = L.Util.requestAnimFrame(this.drawLayer, this);
        }
        return this;
    },

    //-------------------------------------------------------------
    _onLayerDidResize: function (resizeEvent) {
        this._canvas.width = resizeEvent.newSize.x;
        this._canvas.height = resizeEvent.newSize.y;
    },
    //-------------------------------------------------------------
    _onLayerDidMove: function () {
        var topLeft = this._map.containerPointToLayerPoint([0, 0]);
        L.DomUtil.setPosition(this._canvas, topLeft);
        this.drawLayer();
    },
    //-------------------------------------------------------------
    getEvents: function () {
        var events = {
            resize: this._onLayerDidResize,
            moveend: this._onLayerDidMove,
            zoom: this._onLayerDidMove
        };
        if (this._map.options.zoomAnimation && L.Browser.any3d) {
            events.zoomanim = this._animateZoom;
        }

        return events;
    },
    //-------------------------------------------------------------
    onAdd: function (map) {
        this._map = map;
        this._canvas = L.DomUtil.create('canvas', 'leaflet-layer');
        this.tiles = {};

        var size = this._map.getSize();
        this._canvas.width = size.x;
        this._canvas.height = size.y;

        var animated = this._map.options.zoomAnimation && L.Browser.any3d;
        L.DomUtil.addClass(this._canvas, 'leaflet-zoom-' + (animated ? 'animated' : 'hide'));


        map._panes.overlayPane.appendChild(this._canvas);

        map.on(this.getEvents(), this);

        var del = this._delegate || this;
        del.onLayerDidMount && del.onLayerDidMount(); // -- callback
        this.needRedraw();
    },

    //-------------------------------------------------------------
    onRemove: function (map) {
        var del = this._delegate || this;
        del.onLayerWillUnmount && del.onLayerWillUnmount(); // -- callback

        if (this._frame) {
            L.Util.cancelAnimFrame(this._frame);
        }

        map.getPanes().overlayPane.removeChild(this._canvas);

        map.off(this.getEvents(), this);

        this._canvas = null;

    },

    //------------------------------------------------------------
    addTo: function (map) {
        map.addLayer(this);
        return this;
    },
    // --------------------------------------------------------------------------------
    LatLonToMercator: function (latlon) {
        return {
            x: latlon.lng * 6378137 * Math.PI / 180,
            y: Math.log(Math.tan((90 + latlon.lat) * Math.PI / 360)) * 6378137
        };
    },

    //------------------------------------------------------------------------------
    drawLayer: function () {
        // -- todo make the viewInfo properties  flat objects.
        var size = this._map.getSize();
        var bounds = this._map.getBounds();
        var zoom = this._map.getZoom();

        var center = this.LatLonToMercator(this._map.getCenter());
        var corner = this.LatLonToMercator(this._map.containerPointToLatLng(this._map.getSize()));

        var del = this._delegate || this;
        del.onDrawLayer && del.onDrawLayer({
            layer: this,
            canvas: this._canvas,
            bounds: bounds,
            size: size,
            zoom: zoom,
            center: center,
            corner: corner
        });
        this._frame = null;
    },
    // -- L.DomUtil.setTransform from leaflet 1.0.0 to work on 0.0.7
    //------------------------------------------------------------------------------
    _setTransform: function (el, offset, scale) {
        var pos = offset || new L.Point(0, 0);

        el.style[L.DomUtil.TRANSFORM] =
            (L.Browser.ie3d ?
                'translate(' + pos.x + 'px,' + pos.y + 'px)' :
                'translate3d(' + pos.x + 'px,' + pos.y + 'px,0)') +
            (scale ? ' scale(' + scale + ')' : '');
    },

    //------------------------------------------------------------------------------
    _animateZoom: function (e) {
        var scale = this._map.getZoomScale(e.zoom);
        // -- different calc of animation zoom  in leaflet 1.0.3 thanks @peterkarabinovic, @jduggan1
        var offset = L.Layer ? this._map._latLngBoundsToNewLayerBounds(this._map.getBounds(), e.zoom, e.center).min :
            this._map._getCenterOffset(e.center)._multiplyBy(-scale).subtract(this._map._getMapPanePos());

        L.DomUtil.setTransform(this._canvas, offset, scale);


    }
});

L.canvasLayer = function () {
    return new L.CanvasLayer();
};

// WebGL - load obj - w/mtl, normal maps
// from https://webglfundamentals.org/webgl/webgl-load-obj-w-mtl-w-normal-maps.html

"use strict";

// This is not a full .obj parser.
// see http://paulbourke.net/dataformats/obj/

function parseOBJ(text) {
    // because indices are base 1 let's just fill in the 0th data
    const objPositions = [[0, 0, 0]];
    const objTexcoords = [[0, 0]];
    const objNormals = [[0, 0, 0]];
    const objColors = [[0, 0, 0]];

    // same order as `f` indices
    const objVertexData = [
        objPositions,
        objTexcoords,
        objNormals,
        objColors,
    ];

    // same order as `f` indices
    let webglVertexData = [
        [],   // positions
        [],   // texcoords
        [],   // normals
        [],   // colors
    ];

    const materialLibs = [];
    const geometries = [];
    let geometry;
    let groups = ['default'];
    let material = 'default';
    let object = 'default';

    const noop = () => { };

    function newGeometry() {
        // If there is an existing geometry and it's
        // not empty then start a new one.
        if (geometry && geometry.data.position.length) {
            geometry = undefined;
        }
    }

    function setGeometry() {
        if (!geometry) {
            const position = [];
            const texcoord = [];
            const normal = [];
            const color = [];
            webglVertexData = [
                position,
                texcoord,
                normal,
                color,
            ];
            geometry = {
                object,
                groups,
                material,
                data: {
                    position,
                    texcoord,
                    normal,
                    color,
                },
            };
            geometries.push(geometry);
        }
    }

    function addVertex(vert) {
        const ptn = vert.split('/');
        ptn.forEach((objIndexStr, i) => {
            if (!objIndexStr) {
                return;
            }
            const objIndex = parseInt(objIndexStr);
            const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
            webglVertexData[i].push(...objVertexData[i][index]);
            // if this is the position index (index 0) and we parsed
            // vertex colors then copy the vertex colors to the webgl vertex color data
            if (i === 0 && objColors.length > 1) {
                geometry.data.color.push(...objColors[index]);
            }
        });
    }

    const keywords = {
        v(parts) {
            // if there are more than 3 values here they are vertex colors
            if (parts.length > 3) {
                objPositions.push(parts.slice(0, 3).map(parseFloat));
                objColors.push(parts.slice(3).map(parseFloat));
            } else {
                objPositions.push(parts.map(parseFloat));
            }
        },
        vn(parts) {
            objNormals.push(parts.map(parseFloat));
        },
        vt(parts) {
            // should check for missing v and extra w?
            objTexcoords.push(parts.map(parseFloat));
        },
        f(parts) {
            setGeometry();
            const numTriangles = parts.length - 2;
            for (let tri = 0; tri < numTriangles; ++tri) {
                addVertex(parts[0]);
                addVertex(parts[tri + 1]);
                addVertex(parts[tri + 2]);
            }
        },
        s: noop,    // smoothing group
        mtllib(parts, unparsedArgs) {
            // the spec says there can be multiple filenames here
            // but many exist with spaces in a single filename
            materialLibs.push(unparsedArgs);
        },
        usemtl(parts, unparsedArgs) {
            material = unparsedArgs;
            newGeometry();
        },
        g(parts) {
            groups = parts;
            newGeometry();
        },
        o(parts, unparsedArgs) {
            object = unparsedArgs;
            newGeometry();
        },
    };

    const keywordRE = /(\w*)(?: )*(.*)/;
    const lines = text.split('\n');
    for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
        const line = lines[lineNo].trim();
        if (line === '' || line.startsWith('#')) {
            continue;
        }
        const m = keywordRE.exec(line);
        if (!m) {
            continue;
        }
        const [, keyword, unparsedArgs] = m;
        const parts = line.split(/\s+/).slice(1);
        const handler = keywords[keyword];
        if (!handler) {
            console.warn('unhandled keyword:', keyword);  // eslint-disable-line no-console
            continue;
        }
        handler(parts, unparsedArgs);
    }

    // remove any arrays that have no entries.
    for (const geometry of geometries) {
        geometry.data = Object.fromEntries(
            Object.entries(geometry.data).filter(([, array]) => array.length > 0));
    }

    return {
        geometries,
        materialLibs,
    };
}

function parseMapArgs(unparsedArgs) {
    // TODO: handle options
    return unparsedArgs;
}

function parseMTL(text) {
    const materials = {};
    let material;

    const keywords = {
        newmtl(parts, unparsedArgs) {
            material = {};
            materials[unparsedArgs] = material;
        },
        /* eslint brace-style:0 */
        Ns(parts) { material.shininess = parseFloat(parts[0]); },
        Ka(parts) { material.ambient = parts.map(parseFloat); },
        Kd(parts) { material.diffuse = parts.map(parseFloat); },
        Ks(parts) { material.specular = parts.map(parseFloat); },
        Ke(parts) { material.emissive = parts.map(parseFloat); },
        map_Kd(parts, unparsedArgs) { material.diffuseMap = parseMapArgs(unparsedArgs); },
        map_Ns(parts, unparsedArgs) { material.specularMap = parseMapArgs(unparsedArgs); },
        map_Bump(parts, unparsedArgs) { material.normalMap = parseMapArgs(unparsedArgs); },
        Ni(parts) { material.opticalDensity = parseFloat(parts[0]); },
        d(parts) { material.opacity = parseFloat(parts[0]); },
        illum(parts) { material.illum = parseInt(parts[0]); },
    };

    const keywordRE = /(\w*)(?: )*(.*)/;
    const lines = text.split('\n');
    for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
        const line = lines[lineNo].trim();
        if (line === '' || line.startsWith('#')) {
            continue;
        }
        const m = keywordRE.exec(line);
        if (!m) {
            continue;
        }
        const [, keyword, unparsedArgs] = m;
        const parts = line.split(/\s+/).slice(1);
        const handler = keywords[keyword];
        if (!handler) {
            console.warn('unhandled keyword:', keyword);
            continue;
        }
        handler(parts, unparsedArgs);
    }

    return materials;
}

function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}

function create1PixelTexture(gl, pixel) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array(pixel));
    return texture;
}

function createTexture(gl, url) {
    const texture = create1PixelTexture(gl, [128, 192, 255, 255]);
    // Asynchronously load an image
    const image = new Image();
    requestCORSIfNotSameOrigin(image, url)
    image.src = url;
    image.addEventListener('load', function () {
        // Now that the image has loaded make copy it to the texture.
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        // Check if the image is a power of 2 in both dimensions.
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            // Yes, it's a power of 2. Generate mips.
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            // No, it's not a power of 2. Turn of mips and set wrapping to clamp to edge
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    });
    return texture;
}

function makeIndexIterator(indices) {
    let ndx = 0;
    const fn = () => indices[ndx++];
    fn.reset = () => { ndx = 0; };
    fn.numElements = indices.length;
    return fn;
}

function makeUnindexedIterator(positions) {
    let ndx = 0;
    const fn = () => ndx++;
    fn.reset = () => { ndx = 0; };
    fn.numElements = positions.length / 3;
    return fn;
}

const subtractVector2 = (a, b) => a.map((v, ndx) => v - b[ndx]);

function generateTangents(position, texcoord, indices) {
    const getNextIndex = indices ? makeIndexIterator(indices) : makeUnindexedIterator(position);
    const numFaceVerts = getNextIndex.numElements;
    const numFaces = numFaceVerts / 3;

    const tangents = [];
    for (let i = 0; i < numFaces; ++i) {
        const n1 = getNextIndex();
        const n2 = getNextIndex();
        const n3 = getNextIndex();

        const p1 = position.slice(n1 * 3, n1 * 3 + 3);
        const p2 = position.slice(n2 * 3, n2 * 3 + 3);
        const p3 = position.slice(n3 * 3, n3 * 3 + 3);

        const uv1 = texcoord.slice(n1 * 2, n1 * 2 + 2);
        const uv2 = texcoord.slice(n2 * 2, n2 * 2 + 2);
        const uv3 = texcoord.slice(n3 * 2, n3 * 2 + 2);

        const dp12 = m4.subtractVectors(p2, p1);
        const dp13 = m4.subtractVectors(p3, p1);

        const duv12 = subtractVector2(uv2, uv1);
        const duv13 = subtractVector2(uv3, uv1);

        const f = 1.0 / (duv12[0] * duv13[1] - duv13[0] * duv12[1]);
        const tangent = Number.isFinite(f)
            ? m4.normalize(m4.scaleVector(m4.subtractVectors(
                m4.scaleVector(dp12, duv13[1]),
                m4.scaleVector(dp13, duv12[1]),
            ), f))
            : [1, 0, 0];

        tangents.push(...tangent, ...tangent, ...tangent);
    }

    return tangents;
}

async function main(gl) {
    console.log("main");

    if (!gl) {
        return;
    }

    const vs = `
  attribute vec4 a_position;
  attribute vec3 a_normal;
  attribute vec3 a_tangent;
  attribute vec2 a_texcoord;
  attribute vec4 a_color;

  uniform mat4 u_projection;
  uniform mat4 u_view;
  uniform mat4 u_world;
  uniform vec3 u_viewWorldPosition;

  varying vec3 v_normal;
  varying vec3 v_tangent;
  varying vec3 v_surfaceToView;
  varying vec2 v_texcoord;
  varying vec4 v_color;

  void main() {
    vec4 worldPosition = u_world * a_position;
    gl_Position = u_projection * u_view * worldPosition;
    v_surfaceToView = u_viewWorldPosition - worldPosition.xyz;
    mat3 normalMat = mat3(u_world);
    v_normal = normalize(normalMat * a_normal);
    v_tangent = normalize(normalMat * a_tangent);

    v_texcoord = a_texcoord;
    v_color = a_color;
  }
  `;

    const fs = `
  precision highp float;

  varying vec3 v_normal;
  varying vec3 v_tangent;
  varying vec3 v_surfaceToView;
  varying vec2 v_texcoord;
  varying vec4 v_color;

  uniform vec3 diffuse;
  uniform sampler2D diffuseMap;
  uniform vec3 ambient;
  uniform vec3 emissive;
  uniform vec3 specular;
  uniform sampler2D specularMap;
  uniform float shininess;
  uniform sampler2D normalMap;
  uniform float opacity;
  uniform vec3 u_lightDirection;
  uniform vec3 u_ambientLight;

  void main () {
    vec3 normal = normalize(v_normal) * ( float( gl_FrontFacing ) * 2.0 - 1.0 );
    vec3 tangent = normalize(v_tangent) * ( float( gl_FrontFacing ) * 2.0 - 1.0 );
    vec3 bitangent = normalize(cross(normal, tangent));

    mat3 tbn = mat3(tangent, bitangent, normal);
    normal = texture2D(normalMap, v_texcoord).rgb * 2. - 1.;
    normal = normalize(tbn * normal);

    vec3 surfaceToViewDirection = normalize(v_surfaceToView);
    vec3 halfVector = normalize(u_lightDirection + surfaceToViewDirection);

    float fakeLight = dot(u_lightDirection, normal) * .5 + .5;
    float specularLight = clamp(dot(normal, halfVector), 0.0, 1.0);
    vec4 specularMapColor = texture2D(specularMap, v_texcoord);
    vec3 effectiveSpecular = specular * specularMapColor.rgb;

    vec4 diffuseMapColor = texture2D(diffuseMap, v_texcoord);
    vec3 effectiveDiffuse = diffuse * diffuseMapColor.rgb * v_color.rgb;
    float effectiveOpacity = opacity * diffuseMapColor.a * v_color.a;

    gl_FragColor = vec4(
        emissive +
        ambient * u_ambientLight +
        effectiveDiffuse * fakeLight +
        effectiveSpecular * pow(specularLight, shininess),
        effectiveOpacity);
  }
  `;


    // compiles and links the shaders, looks up attribute and uniform locations
    const meshProgramInfo = webglUtils.createProgramInfo(gl, [vs, fs]);

    const objHref = '../public/Windmill/windmill.obj';
    const response = await fetch(objHref);

    if (response.status !== 200) {
        console.error("ERROR: Returned a non-200 code");
        if (response.status === 404) {
            console.error("ERROR: OBJ file not found");
        }
        return;
    }

    const text = await response.text();
    const obj = parseOBJ(text);
    const baseHref = new URL(objHref, window.location.href);
    const matTexts = await Promise.all(obj.materialLibs.map(async filename => {
        const matHref = new URL(filename, baseHref).href;
        const response = await fetch(matHref);
        return await response.text();
    }));
    const materials = parseMTL(matTexts.join('\n'));

    const textures = {
        defaultWhite: create1PixelTexture(gl, [255, 255, 255, 255]),
        defaultNormal: create1PixelTexture(gl, [127, 127, 255, 0]),
    };

    // load texture for materials
    for (const material of Object.values(materials)) {
        Object.entries(material)
            .filter(([key]) => key.endsWith('Map'))
            .forEach(([key, filename]) => {
                let texture = textures[filename];
                if (!texture) {
                    const textureHref = new URL(filename, baseHref).href;
                    texture = createTexture(gl, textureHref);
                    textures[filename] = texture;
                }
                material[key] = texture;
            });
    }

    // hack the materials so we can see the specular map
    Object.values(materials).forEach(m => {
        m.shininess = 25;
        m.specular = [3, 2, 1];
    });

    const defaultMaterial = {
        diffuse: [1, 1, 1],
        diffuseMap: textures.defaultWhite,
        normalMap: textures.defaultNormal,
        ambient: [0, 0, 0],
        specular: [1, 1, 1],
        specularMap: textures.defaultWhite,
        shininess: 400,
        opacity: 1,
    };

    const parts = obj.geometries.map(({ material, data }) => {
        // Because data is just named arrays like this
        //
        // {
        //   position: [...],
        //   texcoord: [...],
        //   normal: [...],
        // }
        //
        // and because those names match the attributes in our vertex
        // shader we can pass it directly into `createBufferInfoFromArrays`
        // from the article "less code more fun".

        if (data.color) {
            if (data.position.length === data.color.length) {
                // it's 3. The our helper library assumes 4 so we need
                // to tell it there are only 3.
                data.color = { numComponents: 3, data: data.color };
            }
        } else {
            // there are no vertex colors so just use constant white
            data.color = { value: [1, 1, 1, 1] };
        }

        // generate tangents if we have the data to do so.
        if (data.texcoord && data.normal) {
            data.tangent = generateTangents(data.position, data.texcoord);
        } else {
            // There are no tangents
            data.tangent = { value: [1, 0, 0] };
        }

        if (!data.texcoord) {
            data.texcoord = { value: [0, 0] };
        }

        if (!data.normal) {
            // we probably want to generate normals if there are none
            data.normal = { value: [0, 0, 1] };
        }

        // create a buffer for each array by calling
        // gl.createBuffer, gl.bindBuffer, gl.bufferData
        const bufferInfo = webglUtils.createBufferInfoFromArrays(gl, data);
        return {
            material: {
                ...defaultMaterial,
                ...materials[material],
            },
            bufferInfo,
        };
    });

    function getExtents(positions) {
        const min = positions.slice(0, 3);
        const max = positions.slice(0, 3);
        for (let i = 3; i < positions.length; i += 3) {
            for (let j = 0; j < 3; ++j) {
                const v = positions[i + j];
                min[j] = Math.min(v, min[j]);
                max[j] = Math.max(v, max[j]);
            }
        }
        return { min, max };
    }

    function getGeometriesExtents(geometries) {
        return geometries.reduce(({ min, max }, { data }) => {
            const minMax = getExtents(data.position);
            return {
                min: min.map((min, ndx) => Math.min(minMax.min[ndx], min)),
                max: max.map((max, ndx) => Math.max(minMax.max[ndx], max)),
            };
        }, {
            min: Array(3).fill(Number.POSITIVE_INFINITY),
            max: Array(3).fill(Number.NEGATIVE_INFINITY),
        });
    }

    const extents = getGeometriesExtents(obj.geometries);
    const range = m4.subtractVectors(extents.max, extents.min);
    // amount to move the object so its center is at the origin
    const objOffset = m4.scaleVector(
        m4.addVectors(
            extents.min,
            m4.scaleVector(range, 0.5)),
        -1);
    const cameraTarget = [0, 0, 0];
    // figure out how far away to move the camera so we can likely
    // see the object.
    const radius = m4.length(range) * 1.2;
    const cameraPosition = m4.addVectors(cameraTarget, [
        0,
        0,
        radius,
    ]);
    // Set zNear and zFar to something hopefully appropriate
    // for the size of this object.
    const zNear = radius / 100;
    const zFar = radius * 3;

    function degToRad(deg) {
        return deg * Math.PI / 180;
    }

    function render(time) {
        time *= 0.001;  // convert to seconds

        webglUtils.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.clearColor(0, 0, 0, 1); // Background Color
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT);

        const fieldOfViewRadians = degToRad(60);
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const projection = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

        const up = [0, 1, 0];
        // Compute the camera's matrix using look at.
        const camera = m4.lookAt(cameraPosition, cameraTarget, up);

        // Make a view matrix from the camera matrix.
        const view = m4.inverse(camera);

        const sharedUniforms = {
            u_lightDirection: m4.normalize([-1, 3, 5]),
            u_view: view,
            u_projection: projection,
            u_viewWorldPosition: cameraPosition,
        };

        gl.useProgram(meshProgramInfo.program);

        // calls gl.uniform
        webglUtils.setUniforms(meshProgramInfo, sharedUniforms);

        // compute the world matrix once since all parts
        // are at the same space.
        // let u_world = m4.yRotation(time);
        let u_world = m4.identity();
        u_world = m4.translate(u_world, ...objOffset);

        for (const { bufferInfo, material } of parts) {
            // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
            webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, bufferInfo);
            // calls gl.uniform
            webglUtils.setUniforms(meshProgramInfo, {
                u_world,
            }, material);
            // calls gl.drawArrays or gl.drawElements
            webglUtils.drawBufferInfo(gl, bufferInfo);
        }

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

/**
 * create the "map" and disable dragging and zooming
 * disabling dragging and zooming is a workaround to prevent render "crash"
 * TO FIX: the rendering "crashes" when a resizing is made
 * The resize is caused also by zoom, dragging and double click
 * A not-navigation provider does not need them
 */
const leafletMap = L.map('map', {zoomControl: false}).setView([50.00, 14.44], 9);
leafletMap.dragging.disable();

L.canvasLayer()
    .delegate(this) // -- if we do not inherit from L.CanvasLayer we can setup a delegate to receive events from L.CanvasLayer
    .addTo(leafletMap);

function onDrawLayer(info) {
    console.log("onDrawLayer")
    let gl = info.canvas.getContext('webgl');
    main(gl);
}

// Click Handler
let mouseDownTime = undefined;

function onMapClick(e) {
    console.log("You clicked the map at " + e.latlng.toString());

    let trigger = true;
    if (trigger) {
        let lat = e.latlng["lat"];
        let lng = e.latlng["lng"];

        let pos = L.latLng([lat, lng]);
        L.marker(pos).addTo(leafletMap);
    }
}

leafletMap.on('mousedown', function () {
    mouseDownTime = new Date().getTime();
});

leafletMap.on('mouseup', function (event) {
    let mouseUpTime = new Date().getTime();
    // compute the difference between press and release
    let timeDiff = mouseUpTime - mouseDownTime;
    console.log(timeDiff);

    // if press and release occur within 150 ms
    //  we consider the event as a click
    if (timeDiff <= 150) {
        console.log("click detected");
        onMapClick(event)
    }
});

// This is needed if the images are not on the same domain
// See: https://webglfundamentals.org/webgl/lessons/webgl-cors-permission.html
function requestCORSIfNotSameOrigin(img, url) {
    if ((new URL(url, window.location.href)).origin !== window.location.origin) {
        img.crossOrigin = "";
    }
}
