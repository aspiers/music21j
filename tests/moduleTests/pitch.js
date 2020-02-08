import * as QUnit from 'qunit';
import * as music21 from '../../src/music21_modules';

const { test } = QUnit;


export default function tests() {

    test('music21.pitch.Accidental', assert => {
        const a = new music21.pitch.Accidental('-');
        assert.equal(a.alter, -1.0, 'flat alter passed');
        assert.equal(a.name, 'flat', 'flat name passed');
        a.name = 'sharp';
        assert.equal(a.alter, 1.0, 'flat alter passed');
        assert.equal(a.name, 'sharp', 'flat name passed');

        const b = new music21.pitch.Accidental('b');
        assert.equal(b.alter, -1.0, 'flat alter passed');
        assert.equal(b.name, 'flat', 'flat name passed');
    });

    test('music21.pitch.Pitch', assert => {
        const p = new music21.pitch.Pitch('D#5');
        assert.equal(p.name, 'D#', 'Pitch Name set to D#');
        assert.equal(p.step, 'D', 'Pitch Step set to D');
        assert.equal(p.octave, 5, 'Pitch octave set to 5');
        assert.equal(p.nameWithOctave, 'D#5', 'Name with octave');
        const c = new music21.clef.AltoClef();
        const vfn = p.vexflowName(c);
        assert.equal(vfn, 'C#/6', 'Vexflow name set');
    });

    test('music21.pitch.Pitch enharmonics', assert => {
        const es = new music21.pitch.Pitch('E-5');
        const dis = es.getLowerEnharmonic();
        assert.equal(es.name, 'E-', 'Original Pitch Name unchanged');
        assert.equal(dis.name, 'D#', 'Pitch Name set to D#');
        assert.equal(dis.step, 'D', 'Pitch Step set to D');
        assert.equal(dis.octave, 5, 'Pitch octave set to 5');

        // inPlace
        dis.getHigherEnharmonic(true); // inPlace
        assert.equal(dis.nameWithOctave, es.nameWithOctave);

        const cDblSharp = new music21.pitch.Pitch('C##5');
        const dNatural = cDblSharp.getHigherEnharmonic();
        assert.equal(cDblSharp.ps, dNatural.ps);
        assert.equal(dNatural.name, 'D', 'C## higher is D');
        assert.equal(dNatural.octave, 5, 'Octave is 5');
        const bTripleSharp = cDblSharp.getLowerEnharmonic();
        assert.equal(cDblSharp.ps, bTripleSharp.ps);
        assert.equal(bTripleSharp.octave, 4, 'Octave is 4 [B###]');

        const cDblFlat = new music21.pitch.Pitch('C--5');
        const bFlat = cDblFlat.getLowerEnharmonic();
        assert.equal(cDblFlat.ps, bFlat.ps);


        // once octaveless pitches exist...
        // const octaveless = new music21.pitch.Pitch('C');
        // const bSharp = octaveless.getLowerEnharmonic();
        // assert.equal(octaveless.octave, undefined, 'octave should be undefined');
        // assert.equal(bSharp.octave, undefined, 'octave should be undefined');
        // assert.equal(bSharp.name, 'B#');

    });

    test('music21.pitch.To String', assert => {
        const p = new music21.pitch.Pitch('B#3');
        assert.equal(p.toString(), '<Pitch B#3>', 'Equal');
    });
    
    test('music21.pitch.Pitch Equality', assert => {
        const pitch_pairs = [
            ['a#', 'a', false],
            ['a#', 'b-', false], 
            ['a#', 'a-', false], 
            ['a##', 'a#', false],
            ['a#4', 'a#4', true], 
            ['a-3', 'a-4', false], 
            ['a#3', 'a#4', false]
        ];
        
        for (const pair of pitch_pairs) {
            const p1 = new music21.pitch.Pitch(pair[0]);
            const p2 = new music21.pitch.Pitch(pair[1]);
            if (!pair[2]) {
                assert.notDeepEqual(p1, p2, 'Not Equal');
            } else {
                assert.deepEqual(p1, p2, 'Equal');
            }
               
        }
        const p1 = new music21.pitch.Pitch('a#');
        const p2 = new music21.pitch.Pitch('a#');
        assert.deepEqual(p1, p2, 'Pitch is Equal');
        p1.octave = 4; 
        p2.octave = 3;
        assert.notDeepEqual(p1, p2, 'Pitch with changed octaves are not equal');
        p1.octave = 4; 
        p2.octave = 4;
        assert.deepEqual(p1, p2, 'Pitch with reverted octaves are equal');
    });

    /*
    test('music21.pitch.Update AccidentaDisplaySeries', assert => {
        const proc = (pList, past) => {
            for (const p of pList) {
                p.updateAccidentalDisplay(past);
                past.append(p);
            }
        };
        const compare = (past, result) => {
            // environLocal.printDebug(['accidental compare'])
            for (let i = 0; i < result.length; i++) {
                const p = past[i];
                if (p.accidental === null) {
                    //const pName = null;
                    //const pDisplayStatus = null;
                } else {
                    const pName = p.accidental.name;
                    const pDisplayStatus = p.accidental.displayStatus;

                    const targetName = result[i][0];
                    const targetDisplayStatus = result[i][1];

                    assert.equal(pName, targetName,
                        'name error for %d: %s instead of desired %s' % (
                            i, pName, targetName));
                    assert.equal(pDisplayStatus, targetDisplayStatus,
                        '%d: %s display: %s, target %s' % (
                            i, p, pDisplayStatus, targetDisplayStatus));
                }
            }
        };
        const Pitch = (pitch) => {
            return new music21.pitch.Pitch(pitch);
        };
        // alternating, in a sequence, same pitch space
        let pList = [Pitch('a#3'), Pitch('a3'), Pitch('a#3'),
            Pitch('a3'), Pitch('a#3')];
        let result = [('sharp', true), ('natural', true), ('sharp', true),
            ('natural', true), ('sharp', true)];
        proc(pList, []);
        compare(pList, result);

        // alternating, in a sequence, different pitch space
        pList = [Pitch('a#2'), Pitch('a6'), Pitch('a#1'),
            Pitch('a5'), Pitch('a#3')];
        result = [('sharp', true), ('natural', true), ('sharp', true),
            ('natural', true), ('sharp', true)];
        proc(pList, []);
        compare(pList, result);

        // alternating, after gaps
        pList = [Pitch('a-2'), Pitch('g3'), Pitch('a5'),
            Pitch('a#5'), Pitch('g-3'), Pitch('a3')];
        result = [('flat', true), (null, null), ('natural', true),
            ('sharp', true), ('flat', true), ('natural', true)];
        proc(pList, []);
        compare(pList, result);

        // epeats of the same: show at different registers
        pList = [Pitch('a-2'), Pitch('a-2'), Pitch('a-5'),
            Pitch('a#5'), Pitch('a#3'), Pitch('a3'), Pitch('a2')];
        result = [('flat', true), ('flat', false), ('flat', true),
            ('sharp', true), ('sharp', true), ('natural', true), ('natural', true)];
        proc(pList, []);
        compare(pList, result);

        // the always- 'unless-repeated' setting
        // first, with no modification, repeated accidentals are not shown
        pList = [Pitch('a-2'), Pitch('a#3'), Pitch('a#5')];
        result = [('flat', true), ('sharp', true), ('sharp', true)];
        proc(pList, []);
        compare(pList, result);

        // second, with status set to always
        pList = [Pitch('a-2'), Pitch('a#3'), Pitch('a#3')];
        pList[2].accidental.displayType = 'always';
        result = [('flat', true), ('sharp', true), ('sharp', true)];
        proc(pList, []);
        compare(pList, result);

        // status set to always
        pList = [Pitch('a2'), Pitch('a3'), Pitch('a5')];
        pList[2].accidental ='natural';
        pList[2].accidental.displayType = 'always';
        result = [(null, null), (null, null), ('natural', true)];
        proc(pList, []);
        compare(pList, result);

        // first use after other pitches in different register
        // note: this will force the display of the accidental
        pList = [Pitch('a-2'), Pitch('g3'), Pitch('a-5')];
        result = [('flat', true), (null, null), ('flat', true)];
        proc(pList, []);
        compare(pList, result);

        // first use after other pitches in different register
        // note: this will force the display of the accidental
        pList = [Pitch('a-2'), Pitch('g3'), Pitch('a-2')];
        // pairs of accidental, displayStatus
        result = [('flat', true), (null, null), ('flat', true)];
        proc(pList, []);
        compare(pList, result);

        // accidentals, first usage, not first pitch
        pList = [Pitch('a2'), Pitch('g#3'), Pitch('d-2')];
        result = [(null, null), ('sharp', true), ('flat', true)];
        proc(pList, []);
        compare(pList, result);
    });
    */
    test('music21.pitch.Accidentals Cautionary', assert => {
        //const conv = music21.key.convertKeyStringToMusic21KeyString;
        const bm = new music21.tinyNotation.TinyNotation("tinynotation: 4/4 fn1 fn1 e-8 e'-8 fn4 en4 e'n4").flat;
        // Function does not work, stream.ts 1353
        //bm.makeNotation(inPlace=True, cautionaryNotImmediateRepeat=False);  

        // Possible bug, first note has accidental information undefined
        assert.equal(bm.flat.elements[2].pitches.accidental, undefined, 'Undefined');
        
        // displayStatus not defined in Note class, or Renamed
        // assert.equal(bm.flat.elements[2].pitch.accName.displayStatus, 'True');
        assert.equal(bm.flat.elements[3].pitch.accidental.name, 'natural', 'Natural');
        //assert.equal(bm.flat.elements[3].pitch.accidental.displayStatus, 'True');
        assert.equal(bm.flat.elements[4].pitch.accidental.name, 'natural', 'Natural');  
        //assert.equal(bm.flat.elements[4].pitch.accidental.displayStatus, 'True');
        assert.equal(bm.flat.elements[5].pitch.accidental.name, 'flat', 'Flat');    
        //assert.equal(bm.flat.elements[5].pitch.accidental.displayStatus, 'True');
        assert.equal(bm.flat.elements[6].pitch.accidental.name, 'flat', 'Flat');    
        //assert.equal(bm.flat.elements[6].pitch.accidental.displayStatus, 'True');
        assert.equal(bm.flat.elements[7].pitch.accidental.name, 'natural', 'Natural');   
        //assert.equal(bm.flat.elements[7].pitch.accidental.displayStatus, 'True');
        assert.notEqual(bm.flat.elements[8].pitch.accidental, 'None', 'None');
        assert.notEqual(bm.flat.elements[8].pitch.accidental.name, 'flat', 'Natural');
        //assert.notEqual(bm.flat.notes[8].pitch.accidental.displayStatus, 'True');
    });

    /* // Transpose is Not Implemented in pitch class
    test('music21.pitch.Low Notes', assert => {
        const dPitch = new music21.pitch.Pitch('D2');
        const lowC = dPitch.transpose('M-23')
        assert.equal(lowC.name, 'C', 'C');
        assert.equal(lowC.octave, -1, '-1'); 
    });
    */ 

    /* // Microtones not supported in Pitch class @ 285 
    test('music21.pitch.Microtone A', assert => {
        let p = new music21.pitch.Pitch('a4');
        p.microtone = 25;
        console.log(p);
        assert.equal(p.toString(), 'A4(+25c)');
        assert.equal(p.ps, 69.25);
        p.microtone = '-10';
        assert.equal(p.toString(), 'A4(-10c)');
        assert.equal(p.ps, 68.90);
        assert.equal(p.pitchClass, 9);
        p = p.transpose(12);
        assert.equal(p.toString(), 'A5(-10c)');
        assert.equal(p.ps, 80.90);

    });
   */

    // Waiting on getHarmonic
    /*
    test('music21.pitch.Microtone B', assert => {
        assert.equal(new music21.pitch.Pitch('c4').getHarmonic(1).toString(), 'C4');

        let p = new music21.pitch.Pitch('c4');
        p.microtone = 20;
        assert.equal(p.toString(0), 'C4(+20c)');
        assert.equal(p.getHarmonic(1).toString(), 'C4(+20c)');

        assert.equal(new music21.pitch.Pitch('c4').getHarmonic(2).toString(), 'C5');
        assert.equal(new music21.pitch.Pitch('c4').getHarmonic(3).toString(), 'G5(+2c)');
        assert.equal(new music21.pitch.Pitch('c4').getHarmonic(4).toString(), 'C6');
        assert.equal(new music21.pitch.Pitch('c4').getHarmonic(5).toString(), 'E6(-14c)');
        assert.equal(new music21.pitch.Pitch('c4').getHarmonic(6).toString(), 'G6(+2c)');
        assert.equal(new music21.pitch.Pitch('c4').getHarmonic(7).toString(), 'A~6(+19c)');

        assert.equal(new music21.pitch.Pitch('g4').harmonicString('c3'), '3rdH(-2c)/C3');

        // ssert.equal(str(_convertPsToStep(60.0)), "('C', <accidental natural>, None, 0)")

        assert.equal(new music21.pitch.Pitch('c4').getHarmonic(1).toString(), 'C4');
        assert.equal(new music21.pitch.Pitch('c3').getHarmonic(2).toString(), 'C4');
        assert.equal(new music21.pitch.Pitch('c2').getHarmonic(2).toString(), 'C3');

        assert.equal(new music21.pitch.Pitch('c4').harmonicString('c3'), '2ndH/C3');

        let f = new music21.pitch.Pitch('c3');
        f.microtone = -10;
        assert.equal(f.getHarmonic(2).toString(), 'C4(-10c)');

        p = new music21.pitch.Pitch('c4');
        f = new music21.pitch.Pitch('c3');
        f.microtone = -20;
        // the third harmonic of c3 -20 is closer than the
        assert.equal(p.harmonicString(f), '2ndH(+20c)/C3(-20c)');

        f.microtone = +20;
        assert.equal(p.harmonicString(f), '2ndH(-20c)/C3(+20c)');

        const p1 = new music21.pitch.Pitch('c1');
        assert.equal(p1.getHarmonic(13).toString(), 'G#~4(-9c)');

        const p2 = new music21.pitch.Pitch('a1');
        assert.equal(p2.getHarmonic(13).toString(0), 'F~5(-9c)');

        assert.equal(p1.transpose('M6').toString(), 'A1');
    });
    */

    // Awaiting Microtone support
    /* 
    test('music21.pitch.Microtone C', assert => {
        const match = [];
        const p = new music21.pitch.Pitch('C4');
        p.microtone = 5;
        for (let i = 0; i < 11; i++) {
            match.push(p.toString());
            p.microtone = p.microtone.cents - 1;
        }
        
        assert.equal(match.toString(),
            "['C4(+5c)', 'C4(+4c)', 'C4(+3c)', 'C4(+2c)', 'C4(+1c)', "
            + "'C4', 'C4(-1c)', 'C4(-2c)', 'C4(-3c)', 'C4(-4c)', 'C4(-5c)']");

    });
    */

}
