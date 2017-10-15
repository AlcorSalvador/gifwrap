'use strict';

const Assert = require('assert');
const Tools = require('./lib/tools');
const { Gif, GifFrame, GifCodec, GifUtil, GifError } = require('../src/index');

// compare decoded encodings with decodings intead of comparing buffers, because there are many ways to encode the same data

const defaultCodec = new GifCodec();

describe("single-frame encoding", () => {

    it("encodes an opaque monochrome GIF", () => {

        const name = 'singleFrameMonoOpaque';
        return _encodeDecodeFile(name, Gif.LocalColorsOnly) // simple code 1st
        .then(() => {
            return _encodeDecodeFile(name, Gif.GlobalColorsOnly);
        });
    });

    it("encodes a transparent GIF", () => {

        const name = 'singleFrameNoColorTrans';
        return _encodeDecodeFile(name, Gif.LocalColorsOnly) // simple code 1st
        .then(() => {
            return _encodeDecodeFile(name, Gif.GlobalColorsOnly);
        });
    });

    it("encodes a monochrome GIF with transparency", () => {

        const name = 'singleFrameMonoTrans';
        return _encodeDecodeFile(name, Gif.LocalColorsOnly) // simple code 1st
        .then(() => {
            return _encodeDecodeFile(name, Gif.GlobalColorsOnly);
        });
    });

    it("encodes a opaque two-color GIF", () => {

        const name = 'singleFrameBWOpaque';
        return _encodeDecodeFile(name, Gif.LocalColorsOnly) // simple code 1st
        .then(() => {
            return _encodeDecodeFile(name, Gif.GlobalColorsOnly);
        });
    });

    it("encodes a opaque multi-color GIF", () => {

        const name = 'singleFrameMultiOpaque';
        return _encodeDecodeFile(name, Gif.LocalColorsOnly) // simple code 1st
        .then(() => {
            return _encodeDecodeFile(name, Gif.GlobalColorsOnly);
        });
    });

    it("encodes a 4-color GIF w/ transparency", () => {

        const name = 'singleFrameMultiTrans';
        return _encodeDecodeFile(name, Gif.LocalColorsOnly); // simple code 1st
        // .then(() => {
        //     return _encodeDecodeFile(name, Gif.GlobalColorsOnly);
        // });
    });
});

describe("multi-frame encoding", () => {

    it("encodes a 2-frame multi-color opaque GIF", () => {

        const name = 'twoFrameMultiOpaque';
        return _encodeDecodeFile(name, Gif.LocalColorsOnly) // simple code 1st
        .then(() => {
            return _encodeDecodeFile(name, Gif.GlobalColorsOnly);
        });
    });

    it("encodes a 3-frame monocolor GIF with transparency", () => {

        const name = 'threeFrameMonoTrans';
        return _encodeDecodeFile(name, Gif.LocalColorsOnly) // simple code 1st
        .then(() => {
            return _encodeDecodeFile(name, Gif.GlobalColorsOnly);
        });
    });

    it("encodes a large multiframe file w/out transparency", () => {

        const name = 'nburling-public';
        return _encodeDecodeFile(name, Gif.LocalColorsOnly) // simple code 1st
        .then(() => {
            return _encodeDecodeFile(name, Gif.GlobalColorsOnly);
        });
    });

    it("encodes a large multiframe file w/ offsets, w/out transparency", () => {

        const name = 'rnaples-offsets-public';
        return _encodeDecodeFile(name, Gif.LocalColorsOnly) // simple code 1st
        .then(() => {
            return _encodeDecodeFile(name, Gif.GlobalColorsOnly);
        });
    });
});

describe("encoding GlobalColorsPreferred", () => {

    it("uses a global color table when 256 colors in 1 frame", () => {

        const frames = [];
        const options = { colorScope: Gif.GlobalColorsPreferred };
        
        frames.push(_get256ColorFrame());

        return defaultCodec.encodeGif(frames, options)
        .then(encodedGif => {

            Assert.ok(true);
            options.colorScope = Gif.GlobalColorsOnly;
            return defaultCodec.encodeGif(frames, options);
        })
        .then(encodedGif => {

            Assert.ok(true);
        })
    });

    it("uses a global color table when 256 colors in each of 2 frames", () => {

        const frames = [];
        const options = { colorScope: Gif.GlobalColorsPreferred };
        
        frames.push(_get256ColorFrame());
        frames.push(_get256ColorFrame());

        return defaultCodec.encodeGif(frames, options)
        .then(encodedGif => {

            Assert.ok(true);
            options.colorScope = Gif.GlobalColorsOnly;
            return defaultCodec.encodeGif(frames, options);
        })
        .then(encodedGif => {

            Assert.ok(true);
        })
    });

    it("uses a global color table when 255 colors + transparency in each of 2 frames", () => {

        const frames = [];
        const options = { colorScope: Gif.GlobalColorsPreferred };
        
        frames.push(_get256ColorFrame());
        frames[0].bitmap.data[3] = 0;
        frames.push(_get256ColorFrame());
        frames[1].bitmap.data[3] = 0;

        return defaultCodec.encodeGif(frames, options)
        .then(encodedGif => {

            Assert.ok(true);
            options.colorScope = Gif.GlobalColorsOnly;
            return defaultCodec.encodeGif(frames, options);
        })
        .then(encodedGif => {

            Assert.ok(true);
        })
    });

    it("uses a local color table when there are 257 opaque colors", () => {

        const frames = [];
        const options = { colorScope: Gif.GlobalColorsPreferred };
        
        frames.push(_get256ColorFrame());
        // put a 257th opaque color in the second frame
        let buf = new Buffer(256 * 4); // defaults to zeroes
        buf[0] = 0; buf[1] = 2; buf[2] = 3; buf[3] = 255;
        frames.push(new GifFrame(16, 16, buf));

        return defaultCodec.encodeGif(frames, options)
        .then(encodedGif => {

            Assert.ok(true);
            options.colorScope = Gif.GlobalColorsOnly;
            return defaultCodec.encodeGif(frames, options);
        })
        .then(encodedGif => {

            Assert.ok(false, "should not encode");
        })
        .catch(err => {

            if (!(err instanceof GifError)) {
                throw err;
            }
            Assert.strictEqual(err.message,
                    "Too many color indexes for global color table");
        });
    });

    it("uses a local color table when there are 256 opaque colors + transparency", () => {

        const frames = [];
        const options = { colorScope: Gif.GlobalColorsPreferred };
        
        frames.push(_get256ColorFrame());
        frames.push(_get256ColorFrame());
        frames[1].bitmap.data[3] = 0;

        return defaultCodec.encodeGif(frames, options)
        .then(encodedGif => {

            Assert.ok(true);
            options.colorScope = Gif.GlobalColorsOnly;
            return defaultCodec.encodeGif(frames, options);
        })
        .then(encodedGif => {

            Assert.ok(false, "should not encode");
        })
        .catch(err => {

            if (!(err instanceof GifError)) {
                throw err;
            }
            Assert.strictEqual(err.message,
                    "Too many color indexes for global color table");
        });
    });

});

function _compareGifs(actual, expected, filename, note) {
    note = `file '${filename}' (${note})`;
    Assert.strictEqual(actual.width, expected.width, note);
    Assert.strictEqual(actual.height, expected.height, note);
    Assert.strictEqual(actual.loops, expected.loops, note);
    Assert.strictEqual(actual.usesTransparency, expected.usesTransparency,
            note);
    if (expected.optionization !== undefined) {
        Assert.strictEqual(actual.optionization, expected.optionization, note);
    }

    Assert(Buffer.isBuffer(actual.buffer), note); 
    Assert(Array.isArray(actual.frames));
    Assert.strictEqual(actual.frames.length, expected.frames.length);
    note = ` in ${note}`;
    for (let i = 0; i < actual.frames.length; ++i) {
        const actualFrame = actual.frames[i];
        const expectedFrame = expected.frames[i];
        Tools.verifyFrameInfo(actualFrame, expectedFrame, i, note);
    }
}

function _encodeDecodeFile(filename, colorScope) {
    let expectedGif;
    return GifUtil.read(Tools.getGifPath(filename))
    .then(readGif => {

        expectedGif = readGif;
        const options = _getFrameOptions(readGif);
        options.colorScope = colorScope;
        return defaultCodec.encodeGif(readGif.frames, options);
    })
    .then(encodedGif => {

        _compareGifs(encodedGif, expectedGif, filename,
                `encoded == read (colorScope ${colorScope})`);
        return defaultCodec.decodeGif(encodedGif.buffer);
    })
    .then(decodedGif => {

        _compareGifs(decodedGif, expectedGif, filename,
                `decoded == read (colorScope ${colorScope})`);
    })
}

function _get256ColorFrame() {
    let buf = new Buffer(256 * 4);
    for (let i = 0; i < 256; ++i) {
        const offset = i * 4;
        buf[offset + 2] = buf[offset + 1] = buf[offset] = i;
        buf[offset + 3] = 255;
    }
    return new GifFrame(16, 16, buf);
}

function _getFrameOptions(frame) {
    const options = Object.assign({}, frame);
    options.frames = undefined;
    options.buffer = undefined;
    return options;
}