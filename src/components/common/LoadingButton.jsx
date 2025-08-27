import { LOADING_TEXT, LOADING_SPINNER_CLASSES } from "../../constants/loadingStates";

function LoadingButton({
  loading,
  disabled,
  onClick,
  type = "button",
  variant = "primary",
  size = "medium",
  className = "",
  children,
  loadingText,
  ...props
}) {
  const getButtonClasses = () => {
    const baseClasses = "transition-all duration-200 font-semibold";
    
    switch (variant) {
      case "primary":
        return loading 
          ? "auth-button auth-button-primary mb-4 opacity-75 cursor-not-allowed"
          : "auth-button auth-button-primary mb-4";
      case "secondary":
        return loading
          ? "auth-button auth-button-secondary opacity-75 cursor-not-allowed"
          : "auth-button auth-button-secondary";
      case "danger":
        return loading
          ? "px-6 py-3 bg-red-600 text-white rounded-lg opacity-75 cursor-not-allowed transition-all duration-200 shadow-md font-semibold"
          : "px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-semibold";
      case "success":
        return loading
          ? "px-6 py-3 bg-green-600 text-white rounded-lg opacity-75 cursor-not-allowed transition-all duration-200 shadow-md font-semibold"
          : "px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-semibold";
      default:
        return className;
    }
  };

  const getSpinnerSize = () => {
    switch (size) {
      case "small":
        return LOADING_SPINNER_CLASSES.SMALL;
      case "medium":
        return LOADING_SPINNER_CLASSES.MEDIUM;
      case "large":
        return LOADING_SPINNER_CLASSES.LARGE;
      default:
        return LOADING_SPINNER_CLASSES.MEDIUM;
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={getButtonClasses()}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center space-x-2">
          <div className={getSpinnerSize()}></div>
          <span>{loadingText || LOADING_TEXT.PROCESSING}</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}

export default LoadingButton;
