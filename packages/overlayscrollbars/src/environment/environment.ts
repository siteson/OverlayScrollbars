import {
  createDOM,
  addClass,
  style,
  appendChildren,
  clientSize,
  absoluteCoordinates,
  offsetSize,
  scrollLeft,
  jsAPI,
  XY,
  removeAttr,
  removeElements,
  windowSize,
} from 'support';

type OnEnvironmentChanged = (env: Environment) => void;

const { abs, round } = Math;
const envornmentElmId = 'os-envornment';

const nativeScrollbarSize = (body: HTMLElement, measureElm: HTMLElement): XY => {
  appendChildren(body, measureElm);
  const cSize = clientSize(measureElm);
  const oSize = offsetSize(measureElm);

  return {
    x: oSize.h - cSize.h,
    y: oSize.w - cSize.w,
  };
};

const nativeScrollbarStyling = (testElm: HTMLElement): boolean => {
  let result = false;
  addClass(testElm, 'os-viewport-native-scrollbars-invisible');
  try {
    result =
      style(testElm, 'scrollbar-width') === 'none' || window.getComputedStyle(testElm, '::-webkit-scrollbar').getPropertyValue('display') === 'none';
  } catch (ex) {}

  return result;
};

const rtlScrollBehavior = (parentElm: HTMLElement, childElm: HTMLElement): { i: boolean; n: boolean } => {
  const strHidden = 'hidden';
  style(parentElm, { overflowX: strHidden, overflowY: strHidden, direction: 'rtl' });
  scrollLeft(parentElm, 0);

  const parentOffset = absoluteCoordinates(parentElm);
  const childOffset = absoluteCoordinates(childElm);
  scrollLeft(parentElm, -999); // https://github.com/KingSora/OverlayScrollbars/issues/187
  const childOffsetAfterScroll = absoluteCoordinates(childElm);
  return {
    /**
     * origin direction = determines if the zero scroll position is on the left or right side
     * 'i' means 'invert' (i === true means that the axis must be inverted to be correct)
     * true = on the left side
     * false = on the right side
     */
    i: parentOffset.x === childOffset.x,
    /**
     * negative = determines if the maximum scroll is positive or negative
     * 'n' means 'negate' (n === true means that the axis must be negated to be correct)
     * true = negative
     * false = positive
     */
    n: childOffset.x !== childOffsetAfterScroll.x,
  };
};

const passiveEvents = (): boolean => {
  let supportsPassive = false;
  try {
    /* eslint-disable */
    // @ts-ignore
    window.addEventListener(
      'test',
      null,
      Object.defineProperty({}, 'passive', {
        get: function () {
          supportsPassive = true;
        },
      })
    );
    /* eslint-enable */
  } catch (e) {}
  return supportsPassive;
};

const windowDPR = (): number => {
  // eslint-disable-next-line
  // @ts-ignore
  const dDPI = window.screen.deviceXDPI || 0;
  // eslint-disable-next-line
  // @ts-ignore
  const sDPI = window.screen.logicalXDPI || 1;
  return window.devicePixelRatio || dDPI / sDPI;
};

const diffBiggerThanOne = (valOne: number, valTwo: number): boolean => {
  const absValOne = abs(valOne);
  const absValTwo = abs(valTwo);
  return !(absValOne === absValTwo || absValOne + 1 === absValTwo || absValOne - 1 === absValTwo);
};

export class Environment {
  #onChangedListener: Set<OnEnvironmentChanged> = new Set();

  _autoUpdateLoop!: boolean;

  _nativeScrollbarSize!: XY;

  _nativeScrollbarIsOverlaid!: XY<boolean>;

  _nativeScrollbarStyling!: boolean;

  _rtlScrollBehavior!: { n: boolean; i: boolean };

  _supportPassiveEvents!: boolean;

  _supportResizeObserver!: boolean;

  constructor() {
    const _self = this;
    const { body } = document;
    const envDOM = createDOM(`<div id="${envornmentElmId}"><div></div></div>`);
    const envElm = envDOM[0] as HTMLElement;
    const envChildElm = envElm.firstChild as HTMLElement;

    const nScrollBarSize = nativeScrollbarSize(body, envElm);
    const nativeScrollbarIsOverlaid = {
      x: nScrollBarSize.x === 0,
      y: nScrollBarSize.y === 0,
    };

    _self._autoUpdateLoop = false;
    _self._nativeScrollbarSize = nScrollBarSize;
    _self._nativeScrollbarIsOverlaid = nativeScrollbarIsOverlaid;
    _self._nativeScrollbarStyling = nativeScrollbarStyling(envElm);
    _self._rtlScrollBehavior = rtlScrollBehavior(envElm, envChildElm);
    _self._supportPassiveEvents = passiveEvents();
    _self._supportResizeObserver = !!jsAPI('ResizeObserver');

    removeAttr(envElm, 'style');
    removeElements(envElm);

    if (!nativeScrollbarIsOverlaid.x || !nativeScrollbarIsOverlaid.y) {
      let size = windowSize();
      let dpr = windowDPR();
      const onChangedListener = this.#onChangedListener;

      window.addEventListener('resize', () => {
        if (onChangedListener.size) {
          const sizeNew = windowSize();
          const deltaSize = {
            w: sizeNew.w - size.w,
            h: sizeNew.h - size.h,
          };

          if (deltaSize.w === 0 && deltaSize.h === 0) return;

          const deltaAbsSize = {
            w: abs(deltaSize.w),
            h: abs(deltaSize.h),
          };
          const deltaAbsRatio = {
            w: abs(round(sizeNew.w / (size.w / 100.0))),
            h: abs(round(sizeNew.h / (size.h / 100.0))),
          };
          const dprNew = windowDPR();
          const deltaIsBigger = deltaAbsSize.w > 2 && deltaAbsSize.h > 2;
          const difference = !diffBiggerThanOne(deltaAbsRatio.w, deltaAbsRatio.h);
          const dprChanged = dprNew !== dpr && dpr > 0;
          const isZoom = deltaIsBigger && difference && dprChanged;

          const oldScrollbarSize = _self._nativeScrollbarSize;
          let newScrollbarSize;

          if (isZoom) {
            newScrollbarSize = _self._nativeScrollbarSize = nativeScrollbarSize(body, envElm);
            removeElements(envElm);

            if (oldScrollbarSize.x !== newScrollbarSize.x || oldScrollbarSize.y !== newScrollbarSize.y) {
              onChangedListener.forEach((listener) => listener && listener(_self));
            }
          }

          size = sizeNew;
          dpr = dprNew;
        }
      });
    }
  }

  addListener(listener: OnEnvironmentChanged): void {
    this.#onChangedListener.add(listener);
  }

  removeListener(listener: OnEnvironmentChanged): void {
    this.#onChangedListener.delete(listener);
  }
}
