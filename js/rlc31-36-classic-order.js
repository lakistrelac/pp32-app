/* RLC31–36: redosled i strane uređaja čitani sa izvornog plana kablova.
 * RLC34 ima PS2 i PS3 DESNO: PS2 iznad PS3.
 */
(function(){'use strict';
Object.assign(window.PP32RlcClassicOrder=window.PP32RlcClassicOrder||{},
{
  "RLC31": {
    "left": [
      "K1/11",
      "K3/13_1"
    ],
    "right": [
      "K3/13_2",
      "K2/12"
    ],
    "lob": "left"
  },
  "RLC32": {
    "left": [
      "K1/11",
      "K3/13_1"
    ],
    "right": [
      "K3/13_2",
      "K2/12"
    ],
    "lob": "left"
  },
  "RLC33": {
    "left": [
      "K1/11",
      "K3/13_1"
    ],
    "right": [
      "K3/13_2",
      "K2/12"
    ],
    "lob": "left"
  },
  "RLC34": {
    "left": [
      "K1/11",
      "K3/13_1"
    ],
    "right": [
      "K3/13_2",
      "K2/12"
    ],
    "lob": "left",
    "positions": {
      "signal-ps2": [
        848,
        273,
        "above"
      ],
      "signal-ps3": [
        848,
        348,
        "above"
      ]
    }
  },
  "RLC35": {
    "left": [
      "K1/11",
      "K3/13_1"
    ],
    "right": [
      "K3/13_2",
      "K2/12"
    ],
    "lob": "left"
  },
  "RLC36": {
    "left": [
      "K1/11",
      "K3/13_1"
    ],
    "right": [
      "K3/13_2",
      "K2/12"
    ],
    "lob": "left"
  }
});
})();
