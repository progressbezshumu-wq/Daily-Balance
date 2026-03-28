import { router } from "expo-router";
import { Linking, Pressable, StyleSheet, Text, TextInput, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMemo, useState } from "react";

import { useSettingsStore } from "../src/store/settingsStore";

type AppLanguage = "en" | "de" | "uk";

function getCopy(language: AppLanguage) {
  if (language === "de") {
    return {
      title: "Feedback",
      description: "Sende uns direkt aus der App eine Nachricht.",
      emailLabel: "E-Mail",
      subjectLabel: "Betreff",
      messageLabel: "Nachricht",
      subjectPlaceholder: "Kurzer Betreff",
      messagePlaceholder: "Beschreibe den Fehler, die Idee oder dein Feedback",
      send: "Senden",
      openMail: "E-Mail öffnen",
      emptyTitle: "Hinweis",
      emptyText: "Bitte fülle Betreff und Nachricht aus.",
    };
  }

  if (language === "uk") {
    return {
      title: "Зворотний звязок",
      description: "Надішли нам повідомлення прямо з додатку.",
      emailLabel: "Email",
      subjectLabel: "Тема",
      messageLabel: "Повідомлення",
      subjectPlaceholder: "Коротка тема",
      messagePlaceholder: "Опиши помилку, ідею або свій відгук",
      send: "Надіслати",
      openMail: "Відкрити email",
      emptyTitle: "Увага",
      emptyText: "Заповни тему та повідомлення.",
    };
  }

  return {
    title: "Feedback",
    description: "Send us a message directly from the app.",
    emailLabel: "Email",
    subjectLabel: "Subject",
    messageLabel: "Message",
    subjectPlaceholder: "Short subject",
    messagePlaceholder: "Describe the bug, idea or your feedback",
    send: "Send",
    openMail: "Open email",
    emptyTitle: "Attention",
    emptyText: "Fill in subject and message.",
  };
}

export default function FeedbackScreen() {
  const language = useSettingsStore((state) => (state.language ?? "en") as AppLanguage);
  const copy = useMemo(() => getCopy(language), [language]);

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleOpenMail = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert(copy.emptyTitle, copy.emptyText);
      return;
    }

    const email = "progressbezshumu@gmail.com";
    const encodedSubject = encodeURIComponent(subject.trim());
    const encodedBody = encodeURIComponent(message.trim());

    await Linking.openURL(
      `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>
        </View>

        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.description}>{copy.description}</Text>

        <View style={styles.card}>
          <Text style={styles.label}>{copy.emailLabel}</Text>
          <Text style={styles.email}>progressbezshumu@gmail.com</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>{copy.subjectLabel}</Text>
          <TextInput
            value={subject}
            onChangeText={setSubject}
            placeholder={copy.subjectPlaceholder}
            placeholderTextColor="#98a2b3"
            style={styles.input}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>{copy.messageLabel}</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder={copy.messagePlaceholder}
            placeholderTextColor="#98a2b3"
            multiline
            textAlignVertical="top"
            style={styles.textarea}
          />
        </View>

        <Pressable style={styles.primaryButton} onPress={handleOpenMail}>
          <Text style={styles.primaryButtonText}>{copy.send}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0f1115",
  },
  container: {
    flex: 1,
    padding: 24,
  },
  topRow: {
    marginBottom: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#1c2230",
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "700",
    marginTop: -2,
  },
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    color: "#98a2b3",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#1c2230",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  label: {
    color: "#98a2b3",
    fontSize: 13,
    marginBottom: 8,
  },
  email: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#111827",
    color: "white",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  textarea: {
    backgroundColor: "#111827",
    color: "white",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 140,
  },
  primaryButton: {
    backgroundColor: "#2f6fed",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});
