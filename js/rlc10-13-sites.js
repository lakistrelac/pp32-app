/* PP32 RLC10–13: uređaji, strane i kablovi iz četiri projektna PDF-a.
   Ne pretvarati redosled/razmake prikaza u geodetske koordinate.
   Zbirne kolone L(m) i br. se ne množe međusobno; zabeležene neusklađenosti ostaju vidljive. */
(function(){'use strict';
Object.assign(window.PP32NewLineSites=window.PP32NewLineSites||{},
{
  "RLC10": {
    "code": "RLC10",
    "name": "Pančevo PBH-2",
    "km": "17+545",
    "line": "Beograd centar–Pančevo glavna–Vršac–državna granica",
    "tag": "PBH-2",
    "stations": [
      "K3/13_1",
      "K3/13_2"
    ],
    "signals": [
      "PS1",
      "PS2"
    ],
    "barriers": [
      "MB1",
      "MB2"
    ],
    "other": [
      "BK",
      "Energetski orman",
      "LOB"
    ],
    "stationDetails": {
      "K3/13_1": "Levo: A-2Y(L)2YB2Y 1×4×0,9, 25 m.",
      "K3/13_2": "Desno: A-2Y(L)2YB2Y 1×4×0,9, 35 m."
    },
    "signalDetails": {
      "PS1": "Levo: A-2Y2YB2Y 40×1×0,9, 25 m.",
      "PS2": "Desno: A-2Y2YB2Y 40×1×0,9, 25 m."
    },
    "barrierDetails": {
      "MB1": "Levo: A-2Y2YB2Y 14×1×0,9 i PP41 4×6 mm², 25 m.",
      "MB2": "Desno: A-2Y2YB2Y 14×1×0,9 i PP41 4×6 mm², 25 m."
    },
    "cables": [
      [
        "1x4x0.9",
        70,
        3
      ],
      [
        "3x4x1.4",
        null,
        null
      ],
      [
        "5x4x1.4",
        null,
        null
      ],
      [
        "10x4x0.9",
        800,
        1
      ],
      [
        "14x1x0.9",
        50,
        2
      ],
      [
        "40x1x0.9",
        50,
        2
      ],
      [
        "4x6mm2",
        850,
        3
      ],
      [
        "3x1.5mm2",
        125,
        4
      ]
    ],
    "notes": "Na originalnoj SPECIFIKACIJI KABLOVA nisu unete kolone L i br. za 3×4×1,4, 5×4×1,4 i 10×4×0,9. Kabl 10×4×0,9 800 m prikazan je na planu kao pult za tastersko uključenje; postojećih 800 m/1 kom u bazi zadržano je kao podatak iz trase, a ne kao potvrđena vrednost zbirne tabele. Napojni kabl 800 m iz ŽS Pančevo Varoš; osvetljenje OS1–OS4.",
    "pdf": "3 - Linijska situacija sa planom kablova putnog prelaza(3).pdf",
    "power_source": "ŽS Pančevo Varoš",
    "sourceRule": "Izvorne oznake i raspored iz projektnog PDF-a. Linijska šema je ilustrativna, bez CAD geodetske razmere."
  },
  "RLC11": {
    "code": "RLC11",
    "name": "Vladimirovac PBC-2",
    "km": "49+577",
    "line": "Beograd centar–Pančevo glavna–Vršac–državna granica",
    "tag": "PBC-2",
    "stations": [
      "K1/11",
      "K3/13_1",
      "K3/13_2",
      "K2/12"
    ],
    "signals": [
      "KS1",
      "KS2",
      "PS1",
      "PS2"
    ],
    "barriers": [
      "MB1",
      "MB2"
    ],
    "other": [
      "BK",
      "Energetski orman",
      "LOB"
    ],
    "stationDetails": {
      "K1/11": "Levo: A-2Y(L)2YDB2Y 3×4×0,9 (2 četv.), 1.080 m.",
      "K3/13_1": "Levo: A-2Y(L)2YB2Y 1×4×0,9, 35 m.",
      "K3/13_2": "Desno: A-2Y(L)2YB2Y 1×4×0,9, 35 m.",
      "K2/12": "Desno: A-2Y(L)2YDB2Y 3×4×0,9 (2 četv.), 1.080 m."
    },
    "signalDetails": {
      "KS1": "Levo: A-2Y(L)2YDB2Y 3×4×1,4, 780 m.",
      "KS2": "Desno: A-2Y(L)2YDB2Y 3×4×1,4, 780 m.",
      "PS1": "Levo: A-2Y2YB2Y 40×1×0,9, 50 m.",
      "PS2": "Desno: A-2Y2YB2Y 40×1×0,9, 50 m."
    },
    "barrierDetails": {
      "MB1": "Levo: A-2Y2YB2Y 14×1×0,9 i PP41 4×6 mm², po 50 m.",
      "MB2": "Desno: A-2Y2YB2Y 14×1×0,9 i PP41 4×6 mm², po 50 m."
    },
    "cables": [
      [
        "1x4x0.9",
        80,
        3
      ],
      [
        "3x4x1.4",
        1560,
        2
      ],
      [
        "3x4x0.9",
        1160,
        2
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
        4100,
        3
      ],
      [
        "3x1.5mm2",
        125,
        4
      ]
    ],
    "notes": "Napojni kabl iz SK Vladimirovac 4.000 m; OS1–OS4. Projektna zbirna tabela navodi 3×4×0,9 L=1.160 m, br.=2, dok se na pojedinačnim granama ka K1/11 i K2/12 vidi po 1.080 m (2.160 m). Neusklađenost zadržana bez korekcije.",
    "pdf": "3 - Linijska situacija sa planom kablova putnog prelaza RLC11.pdf",
    "power_source": "SK Vladimirovac",
    "sourceRule": "Izvorne oznake i raspored iz projektnog PDF-a. Linijska šema je ilustrativna, bez CAD geodetske razmere."
  },
  "RLC12": {
    "code": "RLC12",
    "name": "Pančevo Varoš PBA-1",
    "km": "19+836",
    "line": "Beograd centar–Pančevo glavna–Vršac–državna granica",
    "tag": "PBA-1",
    "stations": [
      "K1/11",
      "K3/13_1",
      "K3/13_2",
      "K2/12"
    ],
    "signals": [
      "KS1",
      "KS2",
      "PS1",
      "PS2"
    ],
    "barriers": [
      "MB1",
      "MB2"
    ],
    "other": [
      "BK",
      "Energetski orman",
      "LOB"
    ],
    "stationDetails": {
      "K1/11": "Levo: A-2Y(L)2YB2Y 3×4×0,9, 1.050 m.",
      "K3/13_1": "Levo: A-2Y(L)2YB2Y 1×4×0,9, 25 m.",
      "K3/13_2": "Desno: A-2Y(L)2YB2Y 1×4×0,9, 35 m.",
      "K2/12": "Desno: A-2Y(L)2YB2Y 3×4×0,9, 1.050 m."
    },
    "signalDetails": {
      "KS1": "Levo: A-2Y(L)2YB2Y 3×4×1,4, 780 m.",
      "KS2": "Desno: A-2Y(L)2YB2Y 3×4×1,4, 780 m.",
      "PS1": "Levo: A-2Y2YB2Y 40×1×0,9, 25 m.",
      "PS2": "Desno: A-2Y2YB2Y 40×1×0,9, 40 m."
    },
    "barrierDetails": {
      "MB1": "Levo: A-2Y2YB2Y 14×1×0,9 i PP41 4×6 mm², 25 m.",
      "MB2": "Desno: A-2Y2YB2Y 14×1×0,9 i PP41 4×6 mm², 40 m."
    },
    "cables": [
      [
        "1x4x0.9",
        70,
        3
      ],
      [
        "3x4x1.4",
        1560,
        2
      ],
      [
        "3x4x0.9",
        660,
        4
      ],
      [
        "10x4x0.9",
        1750,
        1
      ],
      [
        "14x1x0.9",
        65,
        2
      ],
      [
        "40x1x0.9",
        65,
        2
      ],
      [
        "4x6mm2",
        65,
        2
      ],
      [
        "3x1.5mm2",
        125,
        4
      ]
    ],
    "notes": "Napojni kabl iz SK 30 m prikazan je u glavnoj šemi, dok zbirna specifikacija PP41 4×6 mm² prikazuje 65 m i br.=2 (dva polubranika), bez posebnog obračuna napojnog voda. U tabeli 3×4×0,9 stoji 660 m/br.=4, a na granama ka K1/11 i K2/12 po 1.050 m. Čuvaju se izvorne tabelarne vrednosti. OS1–OS4.",
    "pdf": "3 - Linijska situacija sa planom kablova putnog prelaza RLC12.pdf",
    "power_source": "SK Pančevo Varoš",
    "sourceRule": "Izvorne oznake i raspored iz projektnog PDF-a. Linijska šema je ilustrativna, bez CAD geodetske razmere."
  },
  "RLC13": {
    "code": "RLC13",
    "name": "Banatski Karlovci PBD-2",
    "km": "58+060",
    "line": "Beograd centar–Pančevo glavna–Vršac–državna granica",
    "tag": "PBD-2",
    "stations": [
      "K1/11",
      "K3/13_1",
      "K3/13_2"
    ],
    "signals": [
      "KS1",
      "PS1",
      "PS2"
    ],
    "barriers": [
      "MB1",
      "MB2"
    ],
    "other": [
      "BK",
      "Energetski orman",
      "LOB"
    ],
    "stationDetails": {
      "K1/11": "Levo: A-2Y(L)2YB2Y 3×4×0,9, 1.080 m.",
      "K3/13_1": "Levo: A-2Y(L)2YB2Y 1×4×0,9, 60 m.",
      "K3/13_2": "Desno: A-2Y(L)2YB2Y 1×4×0,9, 30 m."
    },
    "signalDetails": {
      "KS1": "Levo: A-2Y(L)2YB2Y 3×4×1,4 (2 četv.), 780 m.",
      "PS1": "Levo: A-2Y2YB2Y 40×1×0,9, 70 m.",
      "PS2": "Desno: A-2Y2YB2Y 40×1×0,9, 25 m."
    },
    "barrierDetails": {
      "MB1": "Levo: A-2Y2YB2Y 14×1×0,9 i PP41 4×6 mm², 70 m.",
      "MB2": "Desno: A-2Y2YB2Y 14×1×0,9 i PP41 4×6 mm², 25 m."
    },
    "cables": [
      [
        "1x4x0.9",
        100,
        3
      ],
      [
        "3x4x0.9",
        780,
        1
      ],
      [
        "3x4x1.4",
        1050,
        1
      ],
      [
        "10x4x0.9",
        1200,
        1
      ],
      [
        "14x1x0.9",
        95,
        2
      ],
      [
        "40x1x0.9",
        95,
        2
      ],
      [
        "4x6mm2",
        95,
        2
      ],
      [
        "3x1.5mm2",
        125,
        4
      ]
    ],
    "notes": "Na planu nema jasno označenog K2/12 niti KS2 — nisu dodati kao uređaji. Napojni kabl iz SK Banatski Karlovci 30 m, a pult za tastersko uključenje 1.200 m A-2Y(L)2YB2Y 10×4×0,9. Tabela kablova 3×4×1,4 navodi 1.050 m, dok crtež za KS1 pokazuje 780 m; vrednosti nisu usaglašavane. Osvetljenje OS1–OS4.",
    "pdf": "3 - Linijska situacija sa planom kablova putnog prelaza RLC13.pdf",
    "power_source": "SK Banatski Karlovci",
    "sourceRule": "Izvorne oznake i raspored iz projektnog PDF-a. Linijska šema je ilustrativna, bez CAD geodetske razmere."
  }
});
})();
