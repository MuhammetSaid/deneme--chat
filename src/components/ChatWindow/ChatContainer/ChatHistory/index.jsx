import HistoricalMessage from "./HistoricalMessage";
import PromptReply from "./PromptReply";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, CircleNotch } from "@phosphor-icons/react";
import { embedderSettings } from "@/main";
import debounce from "lodash.debounce";
import { SEND_TEXT_EVENT } from "..";

export default function ChatHistory({ settings = {}, history = [] }) {
  const replyRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const chatHistoryRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleScroll = () => {
    if (!chatHistoryRef.current) return;
    const diff =
      chatHistoryRef.current.scrollHeight -
      chatHistoryRef.current.scrollTop -
      chatHistoryRef.current.clientHeight;
    // Fuzzy margin for what qualifies as "bottom". Stronger than straight comparison since that may change over time.
    const isBottom = diff <= 40;
    setIsAtBottom(isBottom);
  };

  const debouncedScroll = debounce(handleScroll, 100);
  useEffect(() => {
    function watchScrollEvent() {
      if (!chatHistoryRef.current) return null;
      const chatHistoryElement = chatHistoryRef.current;
      if (!chatHistoryElement) return null;
      chatHistoryElement.addEventListener("scroll", debouncedScroll);
    }
    watchScrollEvent();
  }, []);


  // This function scrolls the chat window to the bottom, ensuring the latest message is visible. The behavior: "smooth" option adds a smooth scrolling effect for a better user experience.
  const scrollToBottom = () => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTo({
        top: chatHistoryRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  if (history.length === 0) {
    return (
      <div className="allm-pb-[100px] allm-pt-[5px] allm-rounded-lg allm-px-2 allm-h-full allm-mt-2 allm-gap-y-2 allm-overflow-y-scroll allm-flex allm-flex-col allm-justify-start allm-no-scroll">
        <div className="allm-flex allm-h-full allm-flex-col allm-items-center allm-justify-center">
          <p className="allm-text-slate-400 allm-text-sm allm-font-sans allm-py-4 allm-text-center">
            {settings?.greeting ?? "Send a chat to get started."}
          </p>
          <SuggestedMessages settings={settings} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="allm-pb-[30px] allm-pt-[5px] allm-rounded-lg allm-px-2 allm-h-full allm-gap-y-2 allm-overflow-y-scroll allm-flex allm-flex-col allm-justify-start allm-no-scroll allm-md:max-h-[500px]"
      id="chat-history"
      ref={chatHistoryRef}
    >
      {history.map((props, index) => {
        const isLastMessage = index === history.length - 1;
        const isLastBotReply =
          index === history.length - 1 && props.role === "assistant";

        if (isLastBotReply && props.animate) {
          return (
            <PromptReply
              key={props.uuid}
              ref={isLastMessage ? replyRef : null}
              uuid={props.uuid}
              reply={props.content}
              pending={props.pending}
              sources={props.sources}
              error={props.error}
              closed={props.closed}
            />
          );
        }

        return (
          <HistoricalMessage
            key={index}
            ref={isLastMessage ? replyRef : null}
            message={props.content}
            sentAt={props.sentAt || Date.now() / 1000}
            role={props.role}
            sources={props.sources}
            chatId={props.chatId}
            feedbackScore={props.feedbackScore}
            error={props.error}
            errorMsg={props.errorMsg}
          />
        );
      })}
      {!isAtBottom && (
        <div className="allm-fixed allm-bottom-[10rem] allm-right-[50px] allm-z-50 allm-cursor-pointer allm-animate-pulse">
          <div className="allm-flex allm-flex-col allm-items-center">
            <div className="allm-p-1 allm-rounded-full allm-border allm-border-white/10 allm-bg-black/20 hover:allm-bg-black/50">
              <ArrowDown
                weight="bold"
                className="allm-text-white/50 allm-w-5 allm-h-5"
                onClick={scrollToBottom}
                id="scroll-to-bottom-button"
                aria-label="Scroll to bottom"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ChatHistoryLoading() {
  return (
    <div className="allm-h-full allm-w-full allm-relative">
      <div className="allm-h-full allm-max-h-[82vh] allm-pb-[100px] allm-pt-[5px] allm-bg-gray-100 allm-rounded-lg allm-px-2 allm-h-full allm-mt-2 allm-gap-y-2 allm-overflow-y-scroll allm-flex allm-flex-col allm-justify-start allm-no-scroll">
        <div className="allm-flex allm-h-full allm-flex-col allm-items-center allm-justify-center">
          <CircleNotch
            size={14}
            className="allm-text-slate-400 allm-animate-spin"
          />
        </div>
      </div>
    </div>
  );
}

function SuggestedMessages({ settings }) {
  if (!settings?.defaultMessages?.length) return null;

  return (
    <div className="allm-flex allm-flex-col allm-gap-y-2 allm-w-[75%]">
      {settings.defaultMessages.map((content, i) => {
        if (content.type === "button") {
          return ( // 'return' ifadesini ekledik
            <button
              key={i}
              style={{
                opacity: 0,
                wordBreak: "break-word",
                backgroundColor: embedderSettings.USER_STYLES.msgBg,
                fontSize: settings.textSize,
              }}
              type="button"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent(SEND_TEXT_EVENT, { detail: { command: content.value } })
                );
              }}
              className={`msg-suggestion allm-border-none hover:allm-shadow-[0_4px_14px_rgba(0,0,0,0.5)] allm-cursor-pointer allm-px-2 allm-py-2 allm-rounded-lg allm-text-white allm-w-full allm-shadow-[0_4px_14px rgba(0,0,0,0.25)]`}
            >
              {content.value}
            </button>
          );
        }
        else if (content.type === "image")
        {
          return (
            <div className="image" style={{width:"200px"}}>
              <img src={content.value} alt="" style={{width:"200px"}}/>
            </div>
          )
        }
        else if (content.type === "text") {
          return (
            <div className="text">
              <p>{content.value}</p>
            </div>
          )
        }
        else if (content.type === "link") 
        {
          return (
            <div className="link">
              <p>
              <a style={{textDecoration:"none" , }} href={content.value}>{content.value}</a>

              </p>
            </div>
          )
        }
        return null; // Eğer content.type "button" değilse, null döndür
      })}

    

    </div>
  );
}