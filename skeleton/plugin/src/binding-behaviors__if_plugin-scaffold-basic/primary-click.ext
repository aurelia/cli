// handle primary button click or a touch
function handlePrimaryClick(event) {
  // mouse event primary button is 0,
  // touch event button is undefined.
  if (event.button) return;
  // only call real callback when it is either primary mouse click or touch event.
  this.primaryClickCallSource(event);
}

export class PrimaryClickBindingBehavior {
  bind(binding) {
    if (!binding.callSource || !binding.targetEvent) throw new Error('primaryClick binding behavior only supports event.');
    binding.primaryClickCallSource = binding.callSource;
    binding.callSource = handlePrimaryClick;
  }

  unbind(binding) {
    binding.callSource = binding.primaryClickCallSource;
    binding.primaryClickCallSource = null;
  }
}
