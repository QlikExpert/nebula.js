/**
 * @typedef {object} scalePalette
 * @property {string} key
 * @property {'gradient'|'class'} type
 * @property {string[]} colors
 */

/**
 * @typedef {object} dataPalette
 * @property {string} key
 * @property {'pyramid'|'row'} type
 * @property {string[]|Array<Array<string>>} colors
 */

/**
 * @typedef {object} colorPickerPalette
 * @property {string} key
 * @property {string[]} colors
 */

export default function theme(resolvedTheme) {
  let uiPalette;

  return {
    palettes(type, key = '') {
      const pals = [];
      if (type === 'qualitative') {
        pals.push(...this.dataPalettes());
      } else if (type === 'scale') {
        pals.push(...this.dataScales());
      } else {
        pals.push(...this.dataPalettes(), ...this.dataScales());
      }
      if (key) {
        return pals.filter(p => p.key === key);
      }
      return pals;
    },
    dataScales() {
      const pals = [];
      resolvedTheme.scales.forEach(s => {
        pals.push({
          key: s.propertyValue,
          name: s.name,
          translation: s.translation,
          scheme: true, // indicate that this is scheme that can be used to generate more colors
          type: s.type, // gradient, class, pyramid, row
          colors: s.scale,
        });
      });

      return pals;
    },
    dataPalettes() {
      const pals = [];
      resolvedTheme.palettes.data.forEach(s => {
        pals.push({
          key: s.propertyValue,
          name: s.name,
          translation: s.translation,
          type: s.type,
          colors: s.scale,
        });
      });

      return pals;
    },
    uiPalettes() {
      const pals = [];
      resolvedTheme.palettes.ui.forEach(s => {
        pals.push({
          key: 'ui',
          name: s.name,
          translation: s.translation,
          type: 'row',
          colors: s.colors,
        });
      });
      return pals;
    },
    dataColors() {
      /** @typedef {object} dataColorSpecials */
      return /** @lends dataColorSpecials */ {
        /** @type {string} */
        primary: resolvedTheme.dataColors.primaryColor,
        /** @type {string} */
        nil: resolvedTheme.dataColors.nullColor,
        /** @type {string} */
        others: resolvedTheme.dataColors.othersColor,
      };
    },
    uiColor(c) {
      if (c.index < 0 || typeof c.index === 'undefined') {
        return c.color;
      }
      if (typeof uiPalette === 'undefined') {
        uiPalette = this.uiPalettes()[0] || false;
      }
      if (!uiPalette) {
        return c.color;
      }
      if (typeof uiPalette.colors[c.index] === 'undefined') {
        return c.color;
      }
      return uiPalette.colors[c.index];
    },
  };
}