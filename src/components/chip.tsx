import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export function Chip({
  texto,
  activo,
  onPress,
}: {
  texto: string;
  activo: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <ThemedView type={activo ? 'backgroundSelected' : 'backgroundElement'} style={styles.chip}>
        <ThemedText type="small" themeColor={activo ? 'text' : 'textSecondary'}>
          {texto}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
});
