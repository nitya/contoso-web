const dialog = document.querySelector("#ask-dialog");
const openButton = document.querySelector("[data-chat-open]");
const closeButton = document.querySelector("[data-chat-close]");
const form = document.querySelector("[data-chat-form]");
const input = document.querySelector("[data-chat-input]");
const messages = document.querySelector("[data-chat-messages]");
const voiceButton = document.querySelector("[data-voice-button]");
const voiceStatus = document.querySelector("[data-voice-status]");

function appendMessage(role, text) {
  const item = document.createElement("li");
  item.className = `chat-message chat-message--${role}`;

  const name = document.createElement("span");
  name.className = "chat-message__name";
  name.textContent = role === "user" ? "You" : "Contoso";

  const message = document.createElement("p");
  message.textContent = text;
  item.append(name, message);
  messages?.append(item);
  if (messages) messages.scrollTop = messages.scrollHeight;
}

openButton?.addEventListener("click", () => {
  if (!dialog?.showModal) return;
  dialog.showModal();
  input?.focus({ preventScroll: true });
});

closeButton?.addEventListener("click", () => dialog?.close());
dialog?.addEventListener("close", () => openButton?.focus());

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input?.value.trim();
  if (!text) {
    input?.focus();
    return;
  }

  appendMessage("user", text);
  if (input) input.value = "";
  if (voiceStatus) voiceStatus.textContent = "Message sent.";
  appendMessage(
    "assistant",
    "Thanks for sharing. This preview is not connected to a live agent yet, but you can explore the catalog while we get ready for your next adventure.",
  );
});

const SpeechRecognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
let recognition = null;
let finalTranscript = "";
let speechError = "";

function setVoiceState(isListening) {
  voiceButton?.setAttribute("aria-pressed", String(isListening));
  voiceButton?.setAttribute(
    "aria-label",
    isListening ? "Stop voice input" : "Start voice input",
  );
}

function voiceErrorMessage(error) {
  if (error === "not-allowed" || error === "service-not-allowed") {
    return "Microphone permission was denied. Allow microphone access in your browser settings and try again.";
  }
  if (error === "no-speech") {
    return "No speech was detected. Try again when you are ready.";
  }
  if (error === "network") {
    return "Voice input could not reach the speech service. Check your connection and try again.";
  }
  if (error === "audio-capture") {
    return "No microphone is available. Connect a microphone and try again.";
  }
  if (error === "aborted") {
    return "Voice input was interrupted before speech was captured. Try again when you are ready.";
  }
  return "Voice input stopped unexpectedly. Please try again.";
}

voiceButton?.addEventListener("click", () => {
  if (!SpeechRecognition) {
    if (voiceStatus) {
      voiceStatus.textContent = "Voice input is not supported in this browser. You can still type a message.";
    }
    return;
  }

  if (recognition) {
    recognition.stop();
    return;
  }

  finalTranscript = "";
  speechError = "";
  recognition = new SpeechRecognition();
  recognition.lang = navigator.language || "en-US";
  recognition.interimResults = true;
  recognition.continuous = false;
  setVoiceState(true);
  if (voiceStatus) voiceStatus.textContent = "Listening. Speak now.";

  recognition.onresult = (event) => {
    let interimTranscript = "";
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const result = event.results[index];
      if (result.isFinal) {
        finalTranscript += result[0].transcript;
      } else {
        interimTranscript += result[0].transcript;
      }
    }
    if (input) {
      input.value = `${finalTranscript} ${interimTranscript}`.trim();
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };

  recognition.onerror = (event) => {
    speechError = event.error;
    if (voiceStatus) voiceStatus.textContent = voiceErrorMessage(event.error);
  };

  recognition.onend = () => {
    setVoiceState(false);
    recognition = null;

    const transcript = finalTranscript.trim();
    if (transcript && form?.requestSubmit) {
      if (input) input.value = transcript;
      if (voiceStatus) voiceStatus.textContent = "Voice transcript sent.";
      form.requestSubmit();
      return;
    }

    if (!speechError && voiceStatus) {
      voiceStatus.textContent = "No speech was detected. Try again when you are ready.";
    }
  };

  try {
    recognition.start();
  } catch (error) {
    recognition = null;
    setVoiceState(false);
    if (voiceStatus) {
      voiceStatus.textContent = error instanceof DOMException && error.name === "NotAllowedError"
        ? voiceErrorMessage("not-allowed")
        : "Voice input could not start. Please try again.";
    }
  }
});
