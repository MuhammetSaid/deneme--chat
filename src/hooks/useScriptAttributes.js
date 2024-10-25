import { useEffect, useState } from "react";
import { embedderSettings } from "../main";

const DEFAULT_SETTINGS = {
  embedId: null, //required
  baseApiUrl: null, // required

  // Override properties that can be defined.
  prompt: null, // override
  model: null, // override
  temperature: null, //override

  // style parameters
  chatIcon: "plus",
  brandImageUrl: null, // will be forced into 100x50px container
  greeting: null, // empty chat window greeting.
  buttonColor: "#31CA9E", // must be hex color code
  userBgColor: "#31CA9E", // user text bubble color
  assistantBgColor: "#2563eb", // assistant text bubble color
  noSponsor: null, // Shows sponsor in footer of chat
  sponsorText: "Powered by AnythingLLM", // default sponsor text
  sponsorLink: "https://anythingllm.com", // default sponsor link
  position: "bottom-right", // position of chat button/window
  assistantName: "AnythingLLM Chat Assistant", // default assistant name
  assistantIcon: "https://media.licdn.com/dms/image/v2/D4D0BAQH3PtnotRnAcQ/company-logo_200_200/company-logo_200_200/0/1713812133762/aiksir_logo?e=1737590400&v=beta&t=a4VSAmyLV58Dn1mSF8rgH_9EMWvMmtfDLmsHFbHFkr8", // default assistant icon
  windowHeight: null, // height of chat window in number:css-prefix
  windowWidth: null, // width of chat window in number:css-prefix
  textSize: null, // text size in px (number only)

  // behaviors
  openOnLoad: "off", // or "on"
  supportEmail: null, // string of email for contact
  username: null, // The display or readable name set on a script
  defaultMessages: [
    {
      "type" : "button",
      "value" : "How I can Help You"
    },
    {
      "type" : "button",
      "value" : "How I can Help You"
    },
    {
      "type" : "button",
      "value" : "How I can Help You"
    },
    {
      "type" : "button",
      "value" : "How I can Help You"
    },
    {
      "type" : "image",
      "value" : "https://benguturkcom.teimg.com/crop/1280x720/benguturk-com/uploads/2024/06/thy-dha-1961834aaa.jpg"
    },
    {
      "type" : "image",
      "value" : "https://benguturkcom.teimg.com/crop/1280x720/benguturk-com/uploads/2024/06/thy-dha-1961834aaa.jpg"
    },
    {
      "type" : "text",
      "value" : "lorem78çkhvbökjhvjgbjnkljb ç jkhgjbknmşnlbvjö mkjbhyugıhojpıubjkn klnuıygıhojpkjıhubn"
    },
    {
      "type" : "link",
      "value" : "https://benguturkcom.teimg.com/crop/1280x720/benguturk-com/uploads/2024/06/thy-dha-1961834aaa.jpg"
    }
    
  ], // list of strings for default messages.
  deneme : [
    [
      {
        "type" : "button",
        "value" : "How I can Help You"
      },
      {
        "type" : "button",
        "value" : "How I can Help You"
      },
      {
        "type" : "button",
        "value" : "How I can Help You"
      },
      {
        "type" : "button",
        "value" : "How I can Help You"
      },
      {
        "type" : "image",
        "value" : "https://benguturkcom.teimg.com/crop/1280x720/benguturk-com/uploads/2024/06/thy-dha-1961834aaa.jpg"
      },
    ],
    [
      {
        "type" : "button",
        "value" : "How I can Help You"
      },
      {
        "type" : "button",
        "value" : "How I can Help You"
      },
      {
        "type" : "button",
        "value" : "How I can Help You"
      },
      {
        "type" : "button",
        "value" : "How I can Help You"
      },
      {
        "type" : "image",
        "value" : "https://benguturkcom.teimg.com/crop/1280x720/benguturk-com/uploads/2024/06/thy-dha-1961834aaa.jpg"
      },
    ],
  ]
};

export default function useGetScriptAttributes() {
  const [settings, setSettings] = useState({
    loaded: false,
    ...DEFAULT_SETTINGS,
  });

  useEffect(() => {
    function fetchAttribs() {
      if (!document) return false;
      if (
        !embedderSettings.settings.baseApiUrl ||
        !embedderSettings.settings.embedId
      )
        throw new Error(
          "[AnythingLLM Embed Module::Abort] - Invalid script tag setup detected. Missing required parameters for boot!"
        );

      setSettings({
        ...DEFAULT_SETTINGS,
        ...parseAndValidateEmbedSettings(embedderSettings.settings),
        loaded: true,
      });
    }
    fetchAttribs();
  }, [document]);

  return settings;
}

const validations = {
  _fallbacks: {
    defaultMessages: [],
  },

  defaultMessages: function (value = null) {
    if (typeof value !== "string") return this._fallbacks.defaultMessages;
    try {
      const list = value.split(",");
      if (
        !Array.isArray(list) ||
        list.length === 0 ||
        !list.every((v) => typeof v === "string" && v.length > 0)
      )
        throw new Error(
          "Invalid default-messages attribute value. Must be array of strings"
        );
      return list.map((v) => v.trim());
    } catch (e) {
      console.error("AnythingLLMEmbed", e);
      return this._fallbacks.defaultMessages;
    }
  },
};

function parseAndValidateEmbedSettings(settings = {}) {
  const validated = {};
  for (let [key, value] of Object.entries(settings)) {
    if (!validations.hasOwnProperty(key)) {
      validated[key] = value;
      continue;
    }

    const validatedValue = validations[key](value);
    validated[key] = validatedValue;
  }

  return validated;
}
