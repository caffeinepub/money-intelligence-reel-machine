import Time "mo:core/Time";
import Array "mo:core/Array";
import Text "mo:core/Text";
import List "mo:core/List";
import Order "mo:core/Order";

actor {
  type Script = {
    content : [Text];
    timestamp : Time.Time;
    topic : ?Text;
  };

  let scripts = List.empty<Script>();

  module Script {
    public func compareByTimestamp(a : Script, b : Script) : Order.Order {
      if (a.timestamp < b.timestamp) { #less } else if (a.timestamp > b.timestamp) {
        #greater;
      } else { #equal };
    };
  };

  let cta = "Follow Money Intelligence India for more insights";

  func formatContentWithCTA(content : [Text]) : [Text] {
    let mainContent = if (content.size() > 0) {
      content.sliceToArray(0, content.size() - 1);
    } else {
      [];
    };
    mainContent.concat([cta]);
  };

  public shared ({ caller }) func generateScript(topic : Text) : async [Text] {
    let script : Script = {
      content = [
        "Lets talk about " # topic,
        "Do you have issues understanding your salary?",
        "Andend up not saving properly because of it?",
        "We are here to create content to help you understand how to manage your money better",
        "All it requires is good money habits and high discipline",
        cta,
      ];
      timestamp = Time.now();
      topic = ?topic;
    };

    scripts.add(script);

    while (scripts.size() > 10) {
      ignore scripts.removeLast();
    };

    script.content;
  };

  public shared ({ caller }) func cleanAndFormatContent(content : [Text]) : async [Text] {
    let cleanedContent = content.map(
      func(line) {
        line.trim(#char(' '));
      }
    );
    let formattedContent = formatContentWithCTA(cleanedContent);

    if (scripts.size() >= 10) {
      ignore scripts.removeLast();
    };

    let newScript : Script = {
      content = formattedContent;
      timestamp = Time.now();
      topic = null;
    };
    scripts.add(newScript);

    formattedContent;
  };

  public query ({ caller }) func getRecentScripts() : async [(Time.Time, [Text])] {
    scripts.toArray().sort(Script.compareByTimestamp).map(
      func(script) { (script.timestamp, script.content) }
    );
  };
};
