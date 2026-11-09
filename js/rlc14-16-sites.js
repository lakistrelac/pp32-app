/* PP32 RLC14–16 · source: user-provided one-page railway drawings.
 * Main plan labels take precedence over title block/file name.
 * Cables: exact source specification L(m) and br. columns, not multiplied.
 * Extra notes preserve discrepancies and cross-RLC connections.
 */
(function(){'use strict';
Object.assign(window.PP32NewLineSites=window.PP32NewLineSites||{},
{
  "RLC14": {
    "code": "RLC14",
    "name": "Subotica PP-1 – Stražara 105",
    "km": "127+680",
    "line": "Bogojevo–državna granica–Erdut",
    "tag": "PP-1",
    "stations": [
      "K1/11",
      "K3/13_1",
      "K3/13_2",
      "K2/12"
    ],
    "stationDetails": {
      "K1/11": "Levo: A-2Y(L)2YB2Y 3×4×0,9, 1.080 m.",
      "K3/13_1": "Levo: A-2Y(L)2YB2Y 1×4×0,9, 35 m.",
      "K3/13_2": "Desno: A-2Y(L)2YB2Y 1×4×0,9, 25 m.",
      "K2/12": "Desno: A-2Y(L)2YDB2Y 3×4×0,9, 1.080 m."
    },
    "signals": [
      "KS1",
      "KS2",
      "PKS",
      "PS1",
      "PS2",
      "PS3"
    ],
    "signalDetails": {
      "KS1": "Levo: A-2Y(L)2YB2Y 3×4×1,4, 780 m.",
      "KS2": "Desno: A-2Y(L)2YDB2Y 3×4×1,4, 780 m.",
      "PKS": "Desno: A-2Y(L)2YB2Y 3×4×1,4, 600 m; na šemi je oznaka PKS.",
      "PS1": "Levo, gornji putni signal: A-2Y2YB2Y 40×1×0,9, 35 m.",
      "PS3": "Levo, ispod PS1: A-2Y2YB2Y 40×1×0,9, 35 m.",
      "PS2": "Desno: A-2Y2YB2Y 40×1×0,9, 25 m."
    },
    "barriers": [
      "MB1",
      "MB2"
    ],
    "barrierDetails": {
      "MB1": "Levo: A-2Y2YB2Y 14×1×0,9 i PP41 4×6 mm², oba po 35 m.",
      "MB2": "Desno: A-2Y2YB2Y 14×1×0,9 i PP41 4×6 mm², oba po 25 m."
    },
    "other": [
      "BK",
      "Energetski orman",
      "LOB"
    ],
    "cables": [
      [
        "1x4x0.9",
        120,
        4
      ],
      [
        "3x4x1.4",
        2160,
        3
      ],
      [
        "3x4x0.9",
        2760,
        3
      ],
      [
        "14x1x0.9",
        60,
        2
      ],
      [
        "40x1x0.9",
        95,
        3
      ],
      [
        "4x6mm2",
        680,
        3
      ],
      [
        "3x1.5mm2",
        125,
        4
      ]
    ],
    "notes": "Položaj sa centralnog crteža: km 127+680. PS1 i PS3 su LEVO, PS1 iznad PS3, PS2 DESNO. PKS (bez broja u oznaci samog signala) prikazan je DESNO, uz KS2; napomena PKS2-PP-1 kod LOB ne označava dodatni signal. Napojni kabl iz SK Subotica Predgrađe 620 m. Peron 40 m i stajalište 128+240 prikazani su na gornjoj linijskoj situaciji; to nije stacionaža PP-1. Kablovska specifikacija prepisana iz PDF tabele.",
    "pdf": "3 - Linijska situacija sa planom kablova putnog prelaza RLC14.pdf",
    "power_source": "SK Subotica Predgrađe"
  },
  "RLC15": {
    "code": "RLC15",
    "name": "Subotica PP-2 – Stražara 105",
    "km": "128+340",
    "line": "Bogojevo–državna granica–Erdut",
    "tag": "PP2",
    "stations": [
      "K1/11",
      "K3/13_1",
      "K5/15_2",
      "K3/13_2",
      "K2/12"
    ],
    "stationLabels": {
      "K5/15_2": "K5/15_2-PP2/PP3"
    },
    "stationDetails": {
      "K1/11": "Levo: A-2Y(L)2YB2Y 3×4×0,9, 1.080 m.",
      "K3/13_1": "Levo: A-2Y(L)2YB2Y 1×4×0,9, 25 m.",
      "K5/15_2": "Levo: zajednička oznaka K5/15_2-PP2/PP3 na crtežu, prikazana sa vodom 1×4×0,9, 50 m.",
      "K3/13_2": "Desno: A-2Y(L)2YB2Y 1×4×0,9, 55 m.",
      "K2/12": "Desno: A-2Y(L)2YB2Y 3×4×0,9, 1.080 m."
    },
    "signals": [
      "KS1",
      "KS2",
      "PKS2",
      "PS1",
      "PS2"
    ],
    "signalDetails": {
      "KS1": "Levo: A-2Y(L)2YB2Y 3×4×1,4 (2 četv.), 780 m.",
      "KS2": "Desno: A-2Y(L)2YB2Y 3×4×1,4 (2 četv.), 780 m.",
      "PKS2": "Levo: A-2Y(L)2YB2Y 3×4×1,4 (2 četv.), 130 m.",
      "PS1": "Levo: A-2Y2YB2Y 40×1×0,9, 50 m.",
      "PS2": "Desno: A-2Y2YB2Y 40×1×0,9, 50 m."
    },
    "barriers": [
      "MB1",
      "MB2"
    ],
    "barrierDetails": {
      "MB1": "Levo: A-2Y2YB2Y 14×1×0,9 i PP41 4×6 mm², po 50 m.",
      "MB2": "Desno: A-2Y2YB2Y 14×1×0,9 i PP41 4×6 mm², po 50 m."
    },
    "other": [
      "BK",
      "Energetski orman",
      "LOB"
    ],
    "cables": [
      [
        "1x4x0.9",
        315,
        5
      ],
      [
        "3x4x1.4",
        1690,
        3
      ],
      [
        "3x4x0.9",
        2310,
        3
      ],
      [
        "14x1x0.9",
        100,
        2
      ],
      [
        "40x1x0.9",
        100,
        2
      ],
      [
        "4x6mm2",
        250,
        3
      ],
      [
        "3x1.5mm2",
        125,
        4
      ]
    ],
    "notes": "Položaj sa centralnog crteža: km 128+340. PKS2 je LEVO zajedno sa KS1, KS2 DESNO. Zajednička oznaka K5/15_2-PP2/PP3 mora ostati prepoznatljiva. Napojni kabl 150 m. Stajalište 128+240 sa peronom 40 m je odvojeno od stacionaže prelaza. U zbirnoj tabeli kabl 1×4×0,9: L=315 m, br.=5; na glavnim vidljivim granama su 25+55+50+10 m. Te vrednosti se ne podudaraju; ne prepravljati projektni zbir bez potvrde.",
    "pdf": "3 - Linijska situacija sa planom kablova putnog prelaza RLC15.pdf",
    "power_source": "Subotica Predgrađe"
  },
  "RLC16": {
    "code": "RLC16",
    "name": "Subotica PP-3 – Stražara 105",
    "km": "128+851",
    "line": "Bogojevo–državna granica–Erdut",
    "tag": "PP3",
    "stations": [
      "K1/11",
      "K3/13_1",
      "K3/13_2",
      "K2/12"
    ],
    "stationDetails": {
      "K1/11": "Levo: A-2Y(L)2YB2Y 3×4×0,9, 1.080 m.",
      "K3/13_1": "Levo: A-2Y(L)2YB2Y 1×4×0,9, 35 m.",
      "K3/13_2": "Desno: A-2Y(L)2YB2Y 1×4×0,9, 25 m.",
      "K2/12": "Desno: A-2Y(L)2YB2Y 3×4×0,9, 1.080 m."
    },
    "signals": [
      "KS1",
      "KS2",
      "PKS2",
      "PS1",
      "PS2"
    ],
    "signalDetails": {
      "KS1": "Levo: A-2Y(L)2YB2Y 3×4×1,4 (2 četv.), 780 m.",
      "KS2": "Desno: A-2Y(L)2YB2Y 3×4×1,4 (2 četv.), 780 m.",
      "PKS2": "Levo: A-2Y(L)2YB2Y 3×4×1,4 (2 četv.), 630 m.",
      "PS1": "Levo: A-2Y2YB2Y 40×1×0,9, 35 m.",
      "PS2": "Desno: A-2Y2YB2Y 40×1×0,9, 25 m."
    },
    "barriers": [
      "MB1",
      "MB2"
    ],
    "barrierDetails": {
      "MB1": "Levo: A-2Y2YB2Y 14×1×0,9 i PP41 4×6 mm², po 35 m.",
      "MB2": "Desno: A-2Y2YB2Y 14×1×0,9 i PP41 4×6 mm², po 25 m."
    },
    "special": [
      {
        "key": "other-k5-15-pp3",
        "label": "K5/15-PP3",
        "item_type": "other",
        "detail": "Oznaka K5/15-PP3 kod prikaza PP-2 Stražara 105; kabl A-2Y(L)2YB2Y 3×4×0,9, 670 m. U crtežu je prikazana sivim simbolom, ne magenta simbolom brojača: tip uređaja ne pretpostavljati."
      }
    ],
    "other": [
      "BK",
      "Energetski orman",
      "LOB"
    ],
    "cables": [
      [
        "1x4x0.9",
        70,
        3
      ],
      [
        "3x4x1.4",
        2190,
        3
      ],
      [
        "3x4x0.9",
        2830,
        3
      ],
      [
        "14x1x0.9",
        60,
        2
      ],
      [
        "40x1x0.9",
        60,
        2
      ],
      [
        "4x6mm2",
        760,
        3
      ],
      [
        "3x1.5mm2",
        125,
        4
      ]
    ],
    "notes": "Centralni crtež navodi km 128+851. PKS2 LEVO sa KS1, KS2 DESNO. Oznaka K5/15-PP3 vezana je kablom 3×4×0,9 dužine 670 m ka objektu PP-2 Stražara 105, nacrtana je drugačijim simbolom od brojača osovina; prikazuje se neutralno kao posebna projektna pozicija. Napojni kabl 700 m. Peron 40 m i stajalište 128+240 su odvojene stacionaže.",
    "pdf": "3 - Linijska situacija sa planom kablova putnog prelaza RLC16.pdf",
    "power_source": "Subotica Predgrađe"
  }
});
})();
