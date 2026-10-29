import { StyleSheet, TextInput, type TextInputProps, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// Etiqueta + TextInput con los colores del tema (claro/oscuro).
export function Campo({ etiqueta, ...props }: { etiqueta: string } & TextInputProps) {
  const theme = useTheme();
  return (
    <View style={styles.campo}>
      <ThemedText type="small" themeColor="textSecondary">
        {etiqueta}
      </ThemedText>
      <TextInput
        placeholderTextColor={theme.textSecondary}
        {...props}
        style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  campo: { gap: Spacing.one },
  input: { minHeight: 44, paddingHorizontal: Spacing.three, borderRadius: Spacing.three, fontSize: 16 },
});
