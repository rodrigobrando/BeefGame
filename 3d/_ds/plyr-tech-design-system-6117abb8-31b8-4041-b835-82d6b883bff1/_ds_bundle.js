/* @ds-bundle: {"format":4,"namespace":"PlyrTechDesignSystem_6117ab","components":[{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Badge","sourcePath":"components/feedback/Badge.jsx"},{"name":"Tag","sourcePath":"components/feedback/Tag.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"},{"name":"Dialog","sourcePath":"components/overlay/Dialog.jsx"},{"name":"Card","sourcePath":"components/surfaces/Card.jsx"}],"sourceHashes":{"components/core/Button.jsx":"a8625c6c739b","components/core/IconButton.jsx":"20e49588914e","components/feedback/Badge.jsx":"26dc43a8ba6c","components/feedback/Tag.jsx":"da0aeab68091","components/feedback/Toast.jsx":"0b9f6b0d6ee7","components/feedback/Tooltip.jsx":"13213b32ac27","components/forms/Checkbox.jsx":"6bf548ce7bdc","components/forms/Input.jsx":"833d22ea7ee4","components/forms/Radio.jsx":"425522e55287","components/forms/Select.jsx":"7c3038f79e73","components/forms/Switch.jsx":"330bd0fe5ce8","components/navigation/Tabs.jsx":"933e326235fb","components/overlay/Dialog.jsx":"0f4a04382674","components/surfaces/Card.jsx":"92d814e2f725","ui_kits/marketing-site/AboutScreen.jsx":"394125570e16","ui_kits/marketing-site/ContactScreen.jsx":"37e295574516","ui_kits/marketing-site/Footer.jsx":"e73d40614d52","ui_kits/marketing-site/HomeScreen.jsx":"d58e403c222e","ui_kits/marketing-site/NavBar.jsx":"f9f3e6d85f5a","ui_kits/marketing-site/ServicesScreen.jsx":"903374027868"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.PlyrTechDesignSystem_6117ab = window.PlyrTechDesignSystem_6117ab || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const sizeStyles = {
  sm: {
    padding: '0 16px',
    height: 36,
    fontSize: 13
  },
  md: {
    padding: '0 20px',
    height: 44,
    fontSize: 15
  },
  lg: {
    padding: '0 28px',
    height: 52,
    fontSize: 16
  }
};
function variantStyle(variant, disabled) {
  if (disabled) {
    return {
      background: variant === 'primary' ? 'var(--ink-700)' : 'transparent',
      color: 'var(--ink-500)',
      border: variant === 'secondary' ? '1px solid var(--border-subtle)' : 'none',
      cursor: 'not-allowed'
    };
  }
  switch (variant) {
    case 'primary':
      return {
        background: 'var(--accent-brand)',
        color: 'var(--text-on-brand)',
        border: 'none'
      };
    case 'secondary':
      return {
        background: 'transparent',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-default)'
      };
    case 'ghost':
      return {
        background: 'transparent',
        color: 'var(--text-primary)',
        border: 'none'
      };
    case 'danger':
      return {
        background: 'var(--accent-danger)',
        color: 'var(--ink-0)',
        border: 'none'
      };
    default:
      return {};
  }
}

/** export function Button(props) */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  icon = null,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const base = variantStyle(variant, disabled);
  let background = base.background;
  if (!disabled && variant === 'primary') {
    background = active ? 'var(--accent-brand-active)' : hover ? 'var(--accent-brand-hover)' : 'var(--accent-brand)';
  }
  if (!disabled && variant === 'secondary') {
    background = hover ? 'var(--surface-2)' : 'transparent';
  }
  if (!disabled && variant === 'ghost') {
    background = hover ? 'var(--surface-2)' : 'transparent';
  }
  return /*#__PURE__*/React.createElement("button", _extends({
    onClick: disabled ? undefined : onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setActive(false);
    },
    onMouseDown: () => setActive(true),
    onMouseUp: () => setActive(false),
    disabled: disabled,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      fontFamily: 'var(--font-sans)',
      font: 'var(--text-button)',
      borderRadius: 'var(--radius-pill)',
      transition: 'background var(--duration-fast) var(--ease-out-quart), transform var(--duration-instant) var(--ease-standard)',
      transform: active && !disabled ? 'scale(0.97)' : 'scale(1)',
      ...sizeStyles[size],
      ...base,
      background,
      ...style
    }
  }, rest), icon, children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const sizes = {
  sm: 32,
  md: 40,
  lg: 48
};

/** export function IconButton(props) */
function IconButton({
  icon,
  size = 'md',
  variant = 'ghost',
  label,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const dim = sizes[size];
  const bg = variant === 'filled' ? hover ? 'var(--accent-brand-hover)' : 'var(--accent-brand)' : hover ? 'var(--surface-2)' : 'transparent';
  const color = variant === 'filled' ? 'var(--text-on-brand)' : 'var(--text-primary)';
  return /*#__PURE__*/React.createElement("button", _extends({
    "aria-label": label,
    title: label,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      width: dim,
      height: dim,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 'var(--radius-pill)',
      border: variant === 'outline' ? '1px solid var(--border-default)' : 'none',
      background: bg,
      color,
      transition: 'background var(--duration-fast) var(--ease-out-quart)',
      ...style
    }
  }, rest), icon);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const toneStyles = {
  neutral: {
    background: 'var(--surface-2)',
    color: 'var(--text-secondary)'
  },
  brand: {
    background: 'color-mix(in oklab, var(--brand-500) 18%, transparent)',
    color: 'var(--brand-300)'
  },
  success: {
    background: 'color-mix(in oklab, var(--accent-success) 18%, transparent)',
    color: 'var(--accent-success)'
  },
  warning: {
    background: 'color-mix(in oklab, var(--accent-warning) 18%, transparent)',
    color: 'var(--accent-warning)'
  },
  danger: {
    background: 'color-mix(in oklab, var(--accent-danger) 18%, transparent)',
    color: 'var(--accent-danger)'
  }
};

/** export function Badge(props) */
function Badge({
  children,
  tone = 'neutral',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      height: 22,
      padding: '0 10px',
      borderRadius: 'var(--radius-pill)',
      font: 'var(--text-caption)',
      letterSpacing: 'var(--tracking-caption)',
      ...toneStyles[tone],
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Badge.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** export function Tag(props) */
function Tag({
  children,
  selected = false,
  onRemove,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("span", _extends({
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      height: 30,
      padding: '0 12px',
      borderRadius: 'var(--radius-pill)',
      font: 'var(--text-body-sm)',
      cursor: onClick ? 'pointer' : 'default',
      border: selected ? '1px solid var(--border-brand)' : '1px solid var(--border-default)',
      color: selected ? 'var(--brand-300)' : 'var(--text-secondary)',
      background: hover ? 'var(--surface-2)' : 'transparent',
      transition: 'background var(--duration-fast) var(--ease-out-quart)',
      ...style
    }
  }, rest), children, onRemove && /*#__PURE__*/React.createElement("span", {
    onClick: e => {
      e.stopPropagation();
      onRemove();
    },
    style: {
      opacity: 0.6,
      fontSize: 14,
      lineHeight: 1
    }
  }, "\xD7"));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tag.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const toneAccent = {
  info: 'var(--accent-info)',
  success: 'var(--accent-success)',
  warning: 'var(--accent-warning)',
  danger: 'var(--accent-danger)'
};

/** export function Toast(props) */
function Toast({
  tone = 'info',
  title,
  description,
  onDismiss,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "status",
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start',
      width: 340,
      padding: 16,
      background: 'var(--surface-1)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-lg)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      marginTop: 6,
      flexShrink: 0,
      borderRadius: '50%',
      background: toneAccent[tone]
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-label)',
      color: 'var(--text-primary)'
    }
  }, title), description && /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-body-sm)',
      color: 'var(--text-secondary)',
      marginTop: 4
    }
  }, description)), onDismiss && /*#__PURE__*/React.createElement("button", {
    onClick: onDismiss,
    "aria-label": "Dismiss",
    style: {
      background: 'none',
      border: 'none',
      color: 'var(--text-tertiary)',
      cursor: 'pointer',
      fontSize: 16,
      lineHeight: 1,
      padding: 0
    }
  }, "\xD7"));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
/** export function Tooltip(props) */
function Tooltip({
  children,
  label,
  side = 'top'
}) {
  const [open, setOpen] = React.useState(false);
  const posStyle = {
    top: {
      bottom: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginBottom: 8
    },
    bottom: {
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      marginTop: 8
    },
    left: {
      right: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      marginRight: 8
    },
    right: {
      left: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      marginLeft: 8
    }
  }[side];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'inline-flex'
    },
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false)
  }, children, /*#__PURE__*/React.createElement("span", {
    role: "tooltip",
    style: {
      position: 'absolute',
      ...posStyle,
      whiteSpace: 'nowrap',
      background: 'var(--ink-100)',
      color: 'var(--ink-950)',
      font: 'var(--text-caption)',
      padding: '6px 10px',
      borderRadius: 'var(--radius-xs)',
      opacity: open ? 1 : 0,
      transform: `${posStyle.transform} ${open ? 'translateY(0)' : 'translateY(2px)'}`,
      transition: 'opacity var(--duration-fast) var(--ease-out-quart)',
      pointerEvents: 'none',
      zIndex: 10
    }
  }, label));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** export function Checkbox(props) */
function Checkbox({
  label,
  checked,
  onChange,
  disabled = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    checked: checked,
    onChange: onChange,
    disabled: disabled,
    style: {
      display: 'none'
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 20,
      height: 20,
      flexShrink: 0,
      borderRadius: 'var(--radius-xs)',
      border: checked ? 'none' : '1.5px solid var(--border-strong)',
      background: checked ? 'var(--accent-brand)' : 'transparent',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background var(--duration-fast) var(--ease-standard)'
    }
  }, checked && /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "10",
    viewBox: "0 0 12 10",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M1 5L4.5 8.5L11 1.5",
    stroke: "var(--text-on-brand)",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-body)',
      color: 'var(--text-primary)'
    }
  }, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** export function Input(props) */
function Input({
  label,
  placeholder,
  type = 'text',
  error,
  disabled = false,
  icon,
  style,
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      width: '100%',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-label)',
      color: 'var(--text-secondary)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      height: 44,
      padding: '0 14px',
      borderRadius: 'var(--radius-sm)',
      background: 'var(--surface-2)',
      border: `1px solid ${error ? 'var(--accent-danger)' : focused ? 'var(--border-brand)' : 'var(--border-subtle)'}`,
      transition: 'border-color var(--duration-fast) var(--ease-standard)',
      opacity: disabled ? 0.5 : 1
    }
  }, icon, /*#__PURE__*/React.createElement("input", _extends({
    type: type,
    placeholder: placeholder,
    disabled: disabled,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      flex: 1,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      color: 'var(--text-primary)',
      font: 'var(--text-body)'
    }
  }, rest))), error && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-caption)',
      color: 'var(--accent-danger)'
    }
  }, error));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** export function Radio(props) */
function Radio({
  label,
  checked,
  onChange,
  disabled = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "radio",
    checked: checked,
    onChange: onChange,
    disabled: disabled,
    style: {
      display: 'none'
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 20,
      height: 20,
      flexShrink: 0,
      borderRadius: '50%',
      border: checked ? '6px solid var(--accent-brand)' : '1.5px solid var(--border-strong)',
      background: 'transparent',
      transition: 'border var(--duration-fast) var(--ease-standard)',
      boxSizing: 'border-box'
    }
  }), label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-body)',
      color: 'var(--text-primary)'
    }
  }, label));
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** export function Select(props) */
function Select({
  label,
  options = [],
  value,
  onChange,
  disabled = false,
  style,
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      width: '100%',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-label)',
      color: 'var(--text-secondary)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: 44,
      borderRadius: 'var(--radius-sm)',
      background: 'var(--surface-2)',
      border: `1px solid ${focused ? 'var(--border-brand)' : 'var(--border-subtle)'}`,
      opacity: disabled ? 0.5 : 1
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    value: value,
    onChange: onChange,
    disabled: disabled,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      width: '100%',
      height: '100%',
      padding: '0 14px',
      border: 'none',
      outline: 'none',
      background: 'transparent',
      color: 'var(--text-primary)',
      font: 'var(--text-body)',
      appearance: 'none'
    }
  }, rest), options.map(opt => /*#__PURE__*/React.createElement("option", {
    key: opt.value ?? opt,
    value: opt.value ?? opt
  }, opt.label ?? opt))), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      right: 14,
      top: '50%',
      transform: 'translateY(-50%)',
      color: 'var(--text-tertiary)',
      pointerEvents: 'none'
    }
  }, "\u25BE")));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** export function Switch(props) */
function Switch({
  label,
  checked,
  onChange,
  disabled = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    checked: checked,
    onChange: onChange,
    disabled: disabled,
    style: {
      display: 'none'
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 40,
      height: 24,
      borderRadius: 'var(--radius-pill)',
      background: checked ? 'var(--accent-brand)' : 'var(--surface-3)',
      position: 'relative',
      transition: 'background var(--duration-fast) var(--ease-standard)',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 3,
      left: checked ? 19 : 3,
      width: 18,
      height: 18,
      borderRadius: '50%',
      background: 'var(--ink-0)',
      transition: 'left var(--duration-base) var(--ease-out-quart)'
    }
  })), label && /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-body)',
      color: 'var(--text-primary)'
    }
  }, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** export function Tabs(props) */
function Tabs({
  tabs = [],
  value,
  onChange,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "tablist",
    style: {
      display: 'inline-flex',
      gap: 4,
      padding: 4,
      background: 'var(--surface-2)',
      borderRadius: 'var(--radius-pill)',
      ...style
    }
  }, rest), tabs.map(tab => {
    const key = tab.value ?? tab;
    const active = key === value;
    return /*#__PURE__*/React.createElement("button", {
      key: key,
      role: "tab",
      "aria-selected": active,
      onClick: () => onChange && onChange(key),
      style: {
        padding: '8px 18px',
        borderRadius: 'var(--radius-pill)',
        border: 'none',
        font: 'var(--text-button)',
        cursor: 'pointer',
        color: active ? 'var(--text-on-brand)' : 'var(--text-secondary)',
        background: active ? 'var(--accent-brand)' : 'transparent',
        transition: 'background var(--duration-base) var(--ease-out-quart), color var(--duration-base) var(--ease-out-quart)'
      }
    }, tab.label ?? tab);
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/overlay/Dialog.jsx
try { (() => {
/** export function Dialog(props) */
function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
  style
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--surface-overlay)',
      backdropFilter: 'var(--blur-modal-backdrop)',
      zIndex: 100,
      animation: 'dc-fade var(--duration-base) var(--ease-out-quart)'
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("style", null, `
        @keyframes dc-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes dc-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `), /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: 420,
      maxWidth: '90vw',
      background: 'var(--surface-1)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-lg)',
      padding: 28,
      animation: 'dc-rise var(--duration-slow) var(--ease-out-quart)',
      ...style
    }
  }, title && /*#__PURE__*/React.createElement("h3", {
    style: {
      font: 'var(--text-h3)',
      letterSpacing: 'var(--tracking-heading)',
      margin: 0,
      marginBottom: 12
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-body)',
      color: 'var(--text-secondary)'
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24,
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 12
    }
  }, footer)));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlay/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** export function Card(props) */
function Card({
  children,
  hoverable = false,
  padding = 'lg',
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const pad = {
    sm: 16,
    md: 20,
    lg: 28
  }[padding];
  return /*#__PURE__*/React.createElement("div", _extends({
    onMouseEnter: () => hoverable && setHover(true),
    onMouseLeave: () => hoverable && setHover(false),
    style: {
      background: hover ? 'var(--surface-card-hover)' : 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: pad,
      boxShadow: hover ? 'var(--shadow-lg)' : 'var(--shadow-md)',
      transition: 'background var(--duration-base) var(--ease-out-quart), box-shadow var(--duration-base) var(--ease-out-quart)',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Card.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing-site/AboutScreen.jsx
try { (() => {
function AboutScreen() {
  const {
    Card,
    Badge
  } = window.PlyrTechDesignSystem_6117ab;
  const values = [{
    title: 'Energia positiva',
    desc: 'We bring an upbeat, can-do energy to every engagement.'
  }, {
    title: 'Respeito',
    desc: 'Plain language, real listening, no jargon walls.'
  }, {
    title: 'Comprometimento em equipe',
    desc: 'We win and ship as one team — never solo heroics.'
  }, {
    title: 'Resultado sustentável',
    desc: "Outcomes that last, not just this quarter's demo."
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--content-max)',
      margin: '0 auto',
      padding: '80px var(--gutter) 120px'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "brand"
  }, "About"), /*#__PURE__*/React.createElement("h1", {
    style: {
      font: 'var(--text-h1)',
      color: 'var(--text-primary)',
      letterSpacing: 'var(--tracking-heading)',
      margin: '16px 0 24px',
      maxWidth: 640
    }
  }, "Ser reconhecida como a empresa que inova a conex\xE3o entre empresas e clientes."), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--text-body-lg)',
      color: 'var(--text-secondary)',
      maxWidth: 640,
      margin: '0 0 64px'
    }
  }, "Oferecemos produtos e servi\xE7os inovadores atrav\xE9s do uso da tecnologia \u2014 essa \xE9 a nossa miss\xE3o, e ela guia cada decis\xE3o que tomamos com nossos clientes."), /*#__PURE__*/React.createElement("h2", {
    style: {
      font: 'var(--text-h2)',
      color: 'var(--text-primary)',
      letterSpacing: 'var(--tracking-heading)',
      margin: '0 0 28px'
    }
  }, "Nossos valores"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 20
    }
  }, values.map(v => /*#__PURE__*/React.createElement(Card, {
    key: v.title
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      font: 'var(--text-h4)',
      color: 'var(--text-primary)',
      margin: '0 0 8px'
    }
  }, v.title), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--text-body-sm)',
      color: 'var(--text-secondary)',
      margin: 0
    }
  }, v.desc)))));
}
window.AboutScreen = AboutScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing-site/AboutScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing-site/ContactScreen.jsx
try { (() => {
function ContactScreen() {
  const {
    Input,
    Select,
    Checkbox,
    Button,
    Toast,
    Badge
  } = window.PlyrTechDesignSystem_6117ab;
  const [submitted, setSubmitted] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 640,
      margin: '0 auto',
      padding: '80px var(--gutter) 140px'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "brand"
  }, "Contact"), /*#__PURE__*/React.createElement("h1", {
    style: {
      font: 'var(--text-h1)',
      color: 'var(--text-primary)',
      letterSpacing: 'var(--tracking-heading)',
      margin: '16px 0 12px'
    }
  }, "Vamos construir algo juntos."), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--text-body-lg)',
      color: 'var(--text-secondary)',
      margin: '0 0 40px'
    }
  }, "Tell us a bit about what you're building \u2014 we typically reply within one business day."), /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      setSubmitted(true);
    },
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Name",
    placeholder: "Your name",
    required: true
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Email",
    type: "email",
    placeholder: "you@company.com",
    required: true
  })), /*#__PURE__*/React.createElement(Select, {
    label: "What do you need?",
    options: ['Product design', 'Web development', 'Mobile app', 'Consulting']
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Project details",
    placeholder: "A few sentences about your project"
  }), /*#__PURE__*/React.createElement(Checkbox, {
    label: "I agree to be contacted about this project",
    defaultChecked: true
  }), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    type: "submit",
    style: {
      alignSelf: 'flex-start'
    }
  }, "Send message")), submitted && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      bottom: 32,
      right: 32
    }
  }, /*#__PURE__*/React.createElement(Toast, {
    tone: "success",
    title: "Message sent",
    description: "We'll be in touch within a day.",
    onDismiss: () => setSubmitted(false)
  })));
}
window.ContactScreen = ContactScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing-site/ContactScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing-site/Footer.jsx
try { (() => {
function Footer() {
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      borderTop: '1px solid var(--border-subtle)',
      padding: '48px var(--gutter)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 24,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo/plyrtech-logo.png",
    alt: "plyr.tech",
    style: {
      height: 18,
      opacity: 0.8
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--text-body-sm)',
      color: 'var(--text-tertiary)',
      margin: 0
    }
  }, "\xA9 2026 plyr.tech \u2014 energia positiva, respeito, resultado sustent\xE1vel."), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      gap: 20
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      font: 'var(--text-body-sm)',
      color: 'var(--text-secondary)'
    }
  }, "LinkedIn"), /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      font: 'var(--text-body-sm)',
      color: 'var(--text-secondary)'
    }
  }, "Instagram")));
}
window.Footer = Footer;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing-site/Footer.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing-site/HomeScreen.jsx
try { (() => {
const services = [{
  title: 'Product design',
  desc: 'From research to pixel-perfect UI, shaped around real outcomes.'
}, {
  title: 'Web development',
  desc: 'Fast, resilient sites and apps built on modern foundations.'
}, {
  title: 'Mobile apps',
  desc: 'Native-feel iOS and Android products for growing teams.'
}, {
  title: 'Consulting',
  desc: 'Technical strategy for teams scaling their product.'
}];
function HomeScreen({
  onNavigate
}) {
  const {
    Button,
    Card,
    Badge
  } = window.PlyrTechDesignSystem_6117ab;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '120px var(--gutter) 100px',
      textAlign: 'center',
      background: 'radial-gradient(60% 50% at 50% 0%, color-mix(in oklab, var(--brand-500) 7%, transparent), transparent)'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "brand"
  }, "plyr.tech"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '20px auto 0',
      maxWidth: 780,
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-sans)',
      fontWeight: 'var(--weight-display)',
      fontSize: 'var(--size-display-1)',
      lineHeight: 'var(--leading-display-1)',
      letterSpacing: 'var(--tracking-display)'
    }
  }, "Tecnologia que aproxima empresas e clientes."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '24px auto 0',
      maxWidth: 560,
      font: 'var(--text-body-lg)',
      color: 'var(--text-secondary)'
    }
  }, "We build the software that connects your business to the people who use it \u2014 products and services shaped by positive energy, respect, and results that last."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 36,
      display: 'flex',
      gap: 16,
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    onClick: () => onNavigate('contact')
  }, "Start a project"), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    variant: "secondary",
    onClick: () => onNavigate('services')
  }, "See our work"))), /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '0 var(--gutter) 100px',
      maxWidth: 'var(--content-max)',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      font: 'var(--text-h2)',
      color: 'var(--text-primary)',
      letterSpacing: 'var(--tracking-heading)',
      margin: '0 0 32px'
    }
  }, "What we do"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 20
    }
  }, services.map(s => /*#__PURE__*/React.createElement(Card, {
    key: s.title,
    hoverable: true
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      font: 'var(--text-h4)',
      color: 'var(--text-primary)',
      margin: '0 0 8px'
    }
  }, s.title), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--text-body-sm)',
      color: 'var(--text-secondary)',
      margin: 0
    }
  }, s.desc))))), /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '0 var(--gutter) 120px',
      maxWidth: 'var(--content-max)',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: "lg",
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      font: 'var(--text-h3)',
      color: 'var(--text-primary)',
      margin: '0 0 8px',
      letterSpacing: 'var(--tracking-heading)'
    }
  }, "Vamos construir algo juntos."), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--text-body)',
      color: 'var(--text-secondary)',
      margin: 0
    }
  }, "Conte um pouco sobre o seu projeto e retornamos em at\xE9 um dia.")), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    onClick: () => onNavigate('contact')
  }, "Fale com a gente"))));
}
window.HomeScreen = HomeScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing-site/HomeScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing-site/NavBar.jsx
try { (() => {
function NavBar({
  route,
  onNavigate
}) {
  const links = [{
    id: 'home',
    label: 'Home'
  }, {
    id: 'services',
    label: 'Services'
  }, {
    id: 'about',
    label: 'About'
  }, {
    id: 'contact',
    label: 'Contact'
  }];
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 var(--gutter)',
      height: 72,
      background: 'color-mix(in oklab, var(--surface-app) 78%, transparent)',
      backdropFilter: 'var(--blur-nav)',
      WebkitBackdropFilter: 'var(--blur-nav)',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#home",
    onClick: () => onNavigate('home'),
    style: {
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo/plyrtech-logo.png",
    alt: "plyr.tech",
    style: {
      height: 22
    }
  })), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      gap: 32
    }
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l.id,
    href: `#${l.id}`,
    onClick: () => onNavigate(l.id),
    style: {
      font: 'var(--text-body-sm)',
      fontWeight: 600,
      color: route === l.id ? 'var(--text-primary)' : 'var(--text-secondary)'
    }
  }, l.label))), /*#__PURE__*/React.createElement(window.PlyrTechDesignSystem_6117ab.Button, {
    size: "sm",
    onClick: () => onNavigate('contact')
  }, "Start a project"));
}
window.NavBar = NavBar;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing-site/NavBar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing-site/ServicesScreen.jsx
try { (() => {
const services = [{
  title: 'Product design',
  desc: 'Research, UX strategy, and interface design that ships.',
  tags: ['Discovery', 'UX/UI', 'Design systems']
}, {
  title: 'Web development',
  desc: 'Marketing sites, dashboards, and internal tools built to last.',
  tags: ['Frontend', 'Backend', 'Performance']
}, {
  title: 'Mobile apps',
  desc: 'iOS and Android products, from prototype to app store.',
  tags: ['iOS', 'Android', 'Cross-platform']
}, {
  title: 'Consulting',
  desc: 'Technical audits and roadmaps for scaling teams.',
  tags: ['Architecture', 'Audits', 'Roadmapping']
}];
function ServicesScreen({
  onNavigate
}) {
  const {
    Card,
    Badge,
    Tag,
    Button
  } = window.PlyrTechDesignSystem_6117ab;
  const [filter, setFilter] = React.useState('All');
  const allTags = ['All', ...new Set(services.flatMap(s => s.tags))];
  const shown = filter === 'All' ? services : services.filter(s => s.tags.includes(filter));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--content-max)',
      margin: '0 auto',
      padding: '80px var(--gutter) 120px'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "brand"
  }, "Services"), /*#__PURE__*/React.createElement("h1", {
    style: {
      font: 'var(--text-h1)',
      color: 'var(--text-primary)',
      letterSpacing: 'var(--tracking-heading)',
      margin: '16px 0 12px'
    }
  }, "Produtos e servi\xE7os, ponta a ponta."), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--text-body-lg)',
      color: 'var(--text-secondary)',
      maxWidth: 640,
      margin: '0 0 40px'
    }
  }, "From the first sketch to production, our team works as one \u2014 no handoffs between strategy and shipping."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      flexWrap: 'wrap',
      marginBottom: 32
    }
  }, allTags.map(t => /*#__PURE__*/React.createElement(Tag, {
    key: t,
    selected: filter === t,
    onClick: () => setFilter(t)
  }, t))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 20
    }
  }, shown.map(s => /*#__PURE__*/React.createElement(Card, {
    key: s.title,
    hoverable: true,
    padding: "lg"
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      font: 'var(--text-h3)',
      color: 'var(--text-primary)',
      margin: '0 0 10px'
    }
  }, s.title), /*#__PURE__*/React.createElement("p", {
    style: {
      font: 'var(--text-body)',
      color: 'var(--text-secondary)',
      margin: '0 0 16px'
    }
  }, s.desc), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, s.tags.map(t => /*#__PURE__*/React.createElement(Badge, {
    key: t,
    tone: "neutral"
  }, t)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginTop: 64
    }
  }, /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    onClick: () => onNavigate('contact')
  }, "Discuss your project")));
}
window.ServicesScreen = ServicesScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing-site/ServicesScreen.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.Card = __ds_scope.Card;

})();
