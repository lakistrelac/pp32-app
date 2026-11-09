/* PP32 · RLC26, RLC28, RLC29: izvor je stvarni crtež, ne naziv fajla.
 * Linijski položaji šeme su ilustrativni. Kablovi su iz tabele izvornog PDF-a.
 * L(m) i br. su odvojene projektne kolone; ništa se ne množi proizvoljno.
 * Neusklađenosti su navedene u notes, ne zamaskirane.
 */
(function(){'use strict';
Object.assign(window.PP32NewLineSites=window.PP32NewLineSites||{},
{
  "RLC26": {
    "code": "RLC26",
    "name": "Svrljig PBA-1",
    "km": "39+605",
    "line": "Crveni Krst–Zaječar–Prahovo pristanište",
    "tag": "PBA-1",
    "stations": [
      "K1/11",
      "K3/13_1a",
      "K3/13_1b",
      "K3/13_2a",
      "K3/13_2b",
      "K5/15-1",
      "K5/15-2",
      "K2/12"
    ],
    "signals": [
      "KS1",
      "KS2",
      "PKS2",
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
    "cables": [
      [
        "1x4x0.9",
        210,
        5
      ],
      [
        "3x4x1.4",
        1760,
        3
      ],
      [
        "10x4x0.9",
        600,
        1
      ],
      [
        "3x4x0.9",
        3450,
        4
      ],
      [
        "14x1x0.9",
        105,
        2
      ],
      [
        "40x1x0.9",
        265,
        2
      ],
      [
        "4x6mm2",
        705,
        3
      ],
      [
        "3x1.5mm2",
        125,
        4
      ]
    ],
    "notes": "Crtež: km 39+605. Industrijski kolosek; KS1, KS2 i PKS2, kao i dve pozicije K5/15 (K5/15-1 i K5/15-2) prikazani su odvojeno. PS1: 3×40×1×0,9 na deonici 80 m, PS2: 40×1×0,9 na 25 m. Napojni PP41 4×6 mm² iz ŽS Svrljig: 600 m; pult za tastersko uključenje 600 m, A-2Y(L)2YB2Y 10×4×0,9. Zbirna specifikacija prepisana bez menjanja kolona L(m) i br.",
    "pdf": "RLC26-RLC26-k(1).pdf",
    "power_source": "ŽS Svrljig"
  },
  "RLC28": {
    "code": "RLC28",
    "name": "Paraćin Blok 2 PBF-8",
    "km": "155+570",
    "line": "Beograd centar–Rasputnica–Mladenovac–Lapovo–Niš–Preševo–državna granica",
    "tag": "PBF-8",
    "stations": [
      "K1/11a",
      "K1/11b",
      "K1/11c",
      "K3/13_1a",
      "K3/13_1b",
      "K3/13_1c",
      "K3/13_2a",
      "K3/13_2b",
      "K3/13_2c",
      "K2/12a",
      "K2/12b"
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
    "cables": [
      [
        "1x4x0.9",
        380,
        9
      ],
      [
        "3x4x0.9",
        3840,
        3
      ],
      [
        "14x1x0.9",
        70,
        2
      ],
      [
        "40x1x0.9",
        100,
        3
      ],
      [
        "4x6mm2",
        570,
        3
      ],
      [
        "3x1.5mm2",
        125,
        4
      ]
    ],
    "notes": "Crtež km 155+570 u višekolosečnom staničnom području ŽS Paraćin. K1/11a–c, K3/13_1a–c, K3/13_2a–c, K2/12a–b su zasebni senzori. PS1 ima 2×40×1×0,9 na 30 m, PS2 40×1×0,9 na 70 m; u zbirnoj tabeli je 40×1×0,9 L=100 m, br.=3. Napojni kabl iz SK Paraćin 500 m; izvodi prema MB1/MB2 su 30 m i 70 m, dok zbirna tabela PP41 4×6 mm² navodi L=570 m, br.=3: dužine grana i zbirna tabela se ne slažu. Zavisnost sa izlaznim signalima ili tastersko uključenje kada ih nema. Šematski prikaz nije CAD geometrija više koloseka.",
    "pdf": "3(3).pdf",
    "power_source": "SK Paraćin"
  },
  "RLC29": {
    "code": "RLC29",
    "name": "Vranje PBQ-1",
    "km": "353+833",
    "line": "Beograd centar–Rasputnica–Mladenovac–Lapovo–Niš–Preševo–državna granica",
    "tag": "PBQ-1",
    "stations": [
      "K1/11",
      "K3/13_1a",
      "K3/13_1b",
      "K3/13_2a",
      "K3/13_2b",
      "K2/12"
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
    "cables": [
      [
        "1x4x0.9",
        150,
        5
      ],
      [
        "3x4x0.9",
        2560,
        2
      ],
      [
        "14x1x0.9",
        100,
        2
      ],
      [
        "40x1x0.9",
        150,
        3
      ],
      [
        "4x6mm2",
        550,
        3
      ],
      [
        "3x1.5mm2",
        125,
        4
      ]
    ],
    "notes": "Crtež km 353+833. PS1: 2×40×1×0,9 na 50 m, PS2: 40×1×0,9 na 50 m. Prikazana zavisnost sa graničnim signalima. Napojni kabl iz SK Vranje 450 m. Na desnoj grani 3×4×0,9 u tekstu stoji A-2Y(L)2YDB2Y, dok zbirna specifikacija navodi A-2Y(L)2YB2Y; prenos u tabelu urađen prema zbirnoj specifikaciji, bez izmišljene ispravke.",
    "pdf": "3 - Linijska situacija sa planom kablova putnog prelaza RLC29.pdf",
    "power_source": "SK Vranje"
  }
});
})();
