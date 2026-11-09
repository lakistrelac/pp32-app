/* Source-side schematic placement for RLC26/28/29.
 * Alternate sensor labels at crowded multiple-axle locations to prevent collisions.
 * Banks follow project left/right connections; distances are not georeferenced.
 */
(function(){'use strict';
Object.assign(window.PP32RlcClassicOrder=window.PP32RlcClassicOrder||{},
{
  "RLC26": {
    "left": [
      "K1/11",
      "K3/13_1b",
      "K3/13_1a"
    ],
    "right": [
      "K3/13_2a",
      "K3/13_2b",
      "K5/15-1",
      "K5/15-2",
      "K2/12"
    ],
    "lob": "right",
    "positions": {
      "sensor-k3-13-2a": [
        760,
        147,
        "below"
      ],
      "sensor-k3-13-2b": [
        836,
        147,
        "above"
      ],
      "sensor-k5-15-1": [
        914,
        147,
        "below"
      ],
      "sensor-k5-15-2": [
        992,
        147,
        "above"
      ],
      "sensor-k2-12": [
        1092,
        147,
        "below"
      ]
    }
  },
  "RLC28": {
    "left": [
      "K1/11a",
      "K1/11b",
      "K1/11c",
      "K3/13_1c",
      "K3/13_1b",
      "K3/13_1a"
    ],
    "right": [
      "K3/13_2a",
      "K3/13_2b",
      "K3/13_2c",
      "K2/12a",
      "K2/12b"
    ],
    "lob": "right",
    "positions": {
      "sensor-k1-11a": [
        130,
        147,
        "below"
      ],
      "sensor-k1-11b": [
        197,
        147,
        "above"
      ],
      "sensor-k1-11c": [
        265,
        147,
        "below"
      ],
      "sensor-k3-13-1c": [
        333,
        147,
        "above"
      ],
      "sensor-k3-13-1b": [
        400,
        147,
        "below"
      ],
      "sensor-k3-13-1a": [
        467,
        147,
        "above"
      ],
      "sensor-k3-13-2a": [
        758,
        147,
        "below"
      ],
      "sensor-k3-13-2b": [
        838,
        147,
        "above"
      ],
      "sensor-k3-13-2c": [
        915,
        147,
        "below"
      ],
      "sensor-k2-12a": [
        995,
        147,
        "above"
      ],
      "sensor-k2-12b": [
        1083,
        147,
        "below"
      ]
    }
  },
  "RLC29": {
    "left": [
      "K1/11",
      "K3/13_1b",
      "K3/13_1a"
    ],
    "right": [
      "K3/13_2a",
      "K3/13_2b",
      "K2/12"
    ],
    "lob": "right"
  }
});
})();
