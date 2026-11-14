// India EV sales — real monthly data compiled from Vahan registration reports
// (Autocar India / Autocar Pro / JMK Research) and FADA. Generated 2026-11-14.
// UPDATE MONTHLY: append the new month to every `sales` / `prevYear` array, bump MONTHS_COVERED and LAST_UPDATED.
// null = figure not reported for that month (never estimated).

export const DATA_YEAR = 2026;
export const MONTHS_COVERED = 10; // Jan–Oct
export const LAST_UPDATED = "2026-11-14";
export const SOURCE = "Vahan registrations (via Autocar India, Autocar Pro, JMK Research) and FADA";
export const STATES_PERIOD = "October 2026";

export const SEGMENT_TOTALS = {
  "car": {
    "sales": [
      18042,
      13669,
      22315,
      23163,
      26221,
      31253,
      32609,
      30418,
      35995,
      36911
    ],
    "prevYear": [
      11909,
      9479,
      null,
      13409,
      null,
      15203,
      17823,
      20095,
      18520,
      20954
    ]
  },
  "two-wheeler": {
    "sales": [
      122477,
      111709,
      190941,
      148740,
      170570,
      193495,
      191949,
      182936,
      207850,
      224064
    ],
    "prevYear": [
      null,
      76722,
      131460,
      92538,
      104896,
      110719,
      null,
      109673,
      109882,
      150890
    ]
  },
  "commercial": {
    "sales": [
      2060,
      2051,
      2459,
      2245,
      2400,
      3214,
      3556,
      4702,
      4188,
      4942
    ],
    "prevYear": [
      null,
      800,
      null,
      902,
      1094,
      1219,
      1324,
      1631,
      1622,
      1884
    ]
  }
};

export const CAR_BRANDS = [
  {
    "brand": "Tata Motors",
    "brandSlug": "tata-ev",
    "sales": [
      7852,
      5558,
      8253,
      8506,
      10231,
      12023,
      13578,
      13070,
      14769,
      14654
    ],
    "prevYear": [
      5292,
      4002,
      null,
      4816,
      5068,
      5355,
      6712,
      8053,
      7353,
      8238
    ]
  },
  {
    "brand": "Mahindra",
    "brandSlug": "mahindra-ev",
    "sales": [
      3589,
      2913,
      5244,
      5394,
      6133,
      7645,
      7677,
      6408,
      7779,
      8541
    ],
    "prevYear": [
      739,
      508,
      null,
      3301,
      3130,
      3513,
      3416,
      4139,
      3972,
      4598
    ]
  },
  {
    "brand": "JSW MG Motor",
    "brandSlug": "mg-ev",
    "sales": [
      4606,
      3310,
      5141,
      4978,
      4936,
      5785,
      5642,
      4602,
      5242,
      5938
    ],
    "prevYear": [
      4527,
      3489,
      null,
      3776,
      4594,
      4691,
      5900,
      5619,
      4800,
      5360
    ]
  },
  {
    "brand": "VinFast",
    "brandSlug": "vinfast",
    "sales": [
      432,
      384,
      691,
      1231,
      1224,
      1394,
      1478,
      2198,
      2963,
      2570
    ],
    "prevYear": [
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      6,
      142
    ]
  },
  {
    "brand": "Kia",
    "brandSlug": "kia-ev",
    "sales": [
      306,
      295,
      458,
      341,
      345,
      446,
      464,
      640,
      1263,
      1395
    ],
    "prevYear": [
      51,
      22,
      null,
      34,
      41,
      50,
      65,
      501,
      598,
      753
    ]
  },
  {
    "brand": "Maruti Suzuki",
    "brandSlug": "maruti-suzuki-ev",
    "sales": [
      210,
      214,
      949,
      1222,
      1577,
      1896,
      1590,
      1405,
      1103,
      1199
    ],
    "prevYear": [
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      0
    ]
  },
  {
    "brand": "Hyundai",
    "brandSlug": "hyundai-ev",
    "sales": [
      326,
      304,
      476,
      512,
      454,
      347,
      565,
      802,
      792,
      759
    ],
    "prevYear": [
      331,
      775,
      null,
      747,
      719,
      596,
      719,
      686,
      404,
      534
    ]
  },
  {
    "brand": "BYD",
    "brandSlug": "byd",
    "sales": [
      224,
      306,
      414,
      467,
      683,
      860,
      742,
      542,
      836,
      737
    ],
    "prevYear": [
      338,
      278,
      null,
      398,
      533,
      508,
      505,
      495,
      732,
      708
    ]
  },
  {
    "brand": "BMW",
    "brandSlug": "bmw-ev",
    "sales": [
      312,
      245,
      437,
      296,
      345,
      486,
      367,
      273,
      502,
      462
    ],
    "prevYear": [
      194,
      239,
      null,
      144,
      201,
      242,
      270,
      422,
      369,
      365
    ]
  },
  {
    "brand": "Tesla",
    "brandSlug": "tesla",
    "sales": [
      37,
      29,
      49,
      43,
      35,
      35,
      115,
      111,
      291,
      291
    ],
    "prevYear": [
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      69,
      40
    ]
  },
  {
    "brand": "Mercedes-Benz",
    "brandSlug": "mercedes-benz-ev",
    "sales": [
      69,
      65,
      97,
      104,
      204,
      234,
      163,
      113,
      125,
      62
    ],
    "prevYear": [
      104,
      72,
      null,
      87,
      122,
      113,
      115,
      110,
      137,
      121
    ]
  }
];

export const TWO_WHEELER_BRANDS = [
  {
    "brand": "TVS Motor",
    "brandSlug": "tvs-iqube",
    "sales": [
      34440,
      31614,
      49304,
      37683,
      42415,
      46999,
      52108,
      48873,
      54179,
      60429
    ],
    "prevYear": [
      24027,
      18955,
      30772,
      19976,
      25804,
      null,
      23592,
      null,
      null,
      31076
    ]
  },
  {
    "brand": "Bajaj Auto (Chetak)",
    "brandSlug": "bajaj-chetak",
    "sales": [
      25520,
      25328,
      46246,
      32898,
      39142,
      43234,
      43224,
      41019,
      48563,
      49067
    ],
    "prevYear": [
      21470,
      21571,
      35215,
      null,
      22643,
      23987,
      20557,
      12246,
      null,
      32462
    ]
  },
  {
    "brand": "Ather Energy",
    "brandSlug": "ather-energy",
    "sales": [
      21923,
      20584,
      35688,
      27034,
      28211,
      31188,
      28596,
      28708,
      30661,
      31796
    ],
    "prevYear": [
      13097,
      11978,
      null,
      13332,
      14101,
      16015,
      17834,
      19210,
      null,
      30246
    ]
  },
  {
    "brand": "Hero Vida",
    "brandSlug": "hero-vida",
    "sales": [
      13274,
      12514,
      21434,
      15238,
      19051,
      21792,
      20934,
      18978,
      24370,
      29901
    ],
    "prevYear": [
      1626,
      2696,
      8039,
      null,
      7385,
      7920,
      10835,
      13769,
      null,
      16499
    ]
  },
  {
    "brand": "Ola Electric",
    "brandSlug": "ola-electric",
    "sales": [
      7512,
      3968,
      10117,
      12171,
      15141,
      16144,
      13113,
      13849,
      13452,
      12096
    ],
    "prevYear": [
      24413,
      8675,
      23634,
      19824,
      18967,
      20697,
      18449,
      null,
      null,
      16439
    ]
  },
  {
    "brand": "Ampere (Greaves)",
    "brandSlug": "ampere",
    "sales": [
      5335,
      4724,
      7965,
      6884,
      7696,
      10928,
      9596,
      8612,
      9318,
      10838
    ],
    "prevYear": [
      3613,
      3704,
      null,
      4003,
      4325,
      4334,
      4266,
      4567,
      null,
      7743
    ]
  },
  {
    "brand": "River",
    "brandSlug": "river",
    "sales": [
      2574,
      2255,
      4146,
      3199,
      3717,
      4391,
      5525,
      5134,
      5599,
      6796
    ],
    "prevYear": [
      611,
      613,
      802,
      796,
      1078,
      1399,
      1680,
      1903,
      null,
      1823
    ]
  },
  {
    "brand": "BGauss",
    "brandSlug": "bgauss",
    "sales": [
      2475,
      2411,
      3680,
      3066,
      3296,
      3916,
      5310,
      4844,
      5024,
      5554
    ],
    "prevYear": [
      null,
      1219,
      2591,
      1313,
      1082,
      null,
      null,
      1729,
      null,
      null
    ]
  }
];

export const COMMERCIAL_BRANDS = [
  {
    "brand": "Tata Motors",
    "brandSlug": "tata-ev-commercial",
    "sales": [
      700,
      638,
      864,
      799,
      879,
      1114,
      1306,
      1416,
      1275,
      1740
    ],
    "prevYear": [
      null,
      297,
      null,
      265,
      230,
      null,
      null,
      null,
      628,
      617
    ]
  },
  {
    "brand": "Euler Motors",
    "brandSlug": "euler-motors",
    "sales": [
      336,
      293,
      469,
      518,
      547,
      700,
      777,
      849,
      1064,
      1272
    ],
    "prevYear": [
      null,
      17,
      null,
      38,
      null,
      null,
      null,
      null,
      61,
      154
    ]
  },
  {
    "brand": "Mahindra (LMM / SML)",
    "brandSlug": "mahindra-commercial",
    "sales": [
      252,
      228,
      268,
      285,
      263,
      315,
      362,
      360,
      464,
      538
    ],
    "prevYear": [
      null,
      118,
      null,
      168,
      null,
      null,
      null,
      null,
      293,
      320
    ]
  },
  {
    "brand": "Switch Mobility",
    "brandSlug": "switch-mobility",
    "sales": [
      192,
      358,
      258,
      144,
      214,
      308,
      null,
      280,
      261,
      236
    ],
    "prevYear": [
      null,
      125,
      null,
      null,
      null,
      null,
      null,
      null,
      160,
      161
    ]
  }
];

export const STATES = [
  {
    "state": "Uttar Pradesh",
    "totalUnits": 47165,
    "avgGrowth": null
  },
  {
    "state": "Maharashtra",
    "totalUnits": 42104,
    "avgGrowth": null
  },
  {
    "state": "Karnataka",
    "totalUnits": 28010,
    "avgGrowth": null
  },
  {
    "state": "Tamil Nadu",
    "totalUnits": 24259,
    "avgGrowth": null
  },
  {
    "state": "Rajasthan",
    "totalUnits": 22991,
    "avgGrowth": null
  },
  {
    "state": "Madhya Pradesh",
    "totalUnits": 21138,
    "avgGrowth": null
  },
  {
    "state": "Odisha",
    "totalUnits": 18611,
    "avgGrowth": null
  },
  {
    "state": "Bihar",
    "totalUnits": 17857,
    "avgGrowth": null
  },
  {
    "state": "Telangana",
    "totalUnits": 16355,
    "avgGrowth": null
  },
  {
    "state": "Gujarat",
    "totalUnits": 15743,
    "avgGrowth": null
  },
  {
    "state": "West Bengal",
    "totalUnits": 14484,
    "avgGrowth": null
  },
  {
    "state": "Delhi",
    "totalUnits": 14212,
    "avgGrowth": null
  }
];
