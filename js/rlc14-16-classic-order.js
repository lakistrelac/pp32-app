/* PP32: RLC14–16 explicit device banks and source-side overrides.
 * PS1 above PS3 on RLC14; PKS2 on LEFT for RLC15/16.
 * All coordinates are only for the existing illustrative SVG, not CAD scale.
 */
(function(){'use strict';
Object.assign(window.PP32RlcClassicOrder=window.PP32RlcClassicOrder||{},
{
  "RLC14": {
    "left": [
      "K1/11",
      "K3/13_1"
    ],
    "right": [
      "K3/13_2",
      "K2/12"
    ],
    "lob": "right",
    "positions": {
      "sensor-k1-11": [
        220,
        146,
        "below"
      ],
      "sensor-k3-13-1": [
        465,
        146,
        "below"
      ],
      "sensor-k3-13-2": [
        760,
        146,
        "below"
      ],
      "sensor-k2-12": [
        1060,
        146,
        "below"
      ],
      "signal-ks1": [
        265,
        235,
        "below"
      ],
      "signal-pks": [
        800,
        235,
        "below"
      ],
      "signal-ks2": [
        1070,
        235,
        "below"
      ],
      "signal-ps1": [
        399,
        290,
        "above"
      ],
      "signal-ps3": [
        399,
        369,
        "above"
      ],
      "signal-ps2": [
        849,
        348,
        "above"
      ]
    }
  },
  "RLC15": {
    "left": [
      "K5/15_2",
      "K1/11",
      "K3/13_1"
    ],
    "right": [
      "K3/13_2",
      "K2/12"
    ],
    "lob": "right",
    "positions": {
      "sensor-k5-15-2": [
        136,
        146,
        "below"
      ],
      "sensor-k1-11": [
        335,
        146,
        "below"
      ],
      "sensor-k3-13-1": [
        486,
        146,
        "below"
      ],
      "sensor-k3-13-2": [
        770,
        146,
        "below"
      ],
      "sensor-k2-12": [
        1060,
        146,
        "below"
      ],
      "signal-ks1": [
        255,
        238,
        "below"
      ],
      "signal-pks2": [
        460,
        238,
        "below"
      ],
      "signal-ks2": [
        955,
        238,
        "below"
      ]
    }
  },
  "RLC16": {
    "left": [
      "K1/11",
      "K3/13_1"
    ],
    "right": [
      "K3/13_2",
      "K2/12"
    ],
    "lob": "right",
    "positions": {
      "sensor-k1-11": [
        232,
        146,
        "below"
      ],
      "sensor-k3-13-1": [
        466,
        146,
        "below"
      ],
      "sensor-k3-13-2": [
        770,
        146,
        "below"
      ],
      "sensor-k2-12": [
        1060,
        146,
        "below"
      ],
      "signal-ks1": [
        255,
        238,
        "below"
      ],
      "signal-pks2": [
        460,
        238,
        "below"
      ],
      "signal-ks2": [
        955,
        238,
        "below"
      ],
      "other-k5-15-pp3": [
        355,
        555,
        "below"
      ]
    }
  }
});
})();
