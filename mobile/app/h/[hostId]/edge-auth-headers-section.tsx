import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { colors, radii, spacing, typography } from '../../../src/theme/mobile-theme'

export type EdgeAuthRow = { id: string; name: string; value: string }

let nextRowId = 0

export function newEdgeAuthRow(): EdgeAuthRow {
  nextRowId += 1
  return { id: `edge-auth-${nextRowId}`, name: '', value: '' }
}

export function EdgeAuthHeadersSection({
  rows,
  storedCount,
  error,
  onRowsChange
}: {
  rows: EdgeAuthRow[]
  storedCount: number
  error: string | null
  onRowsChange: (rows: EdgeAuthRow[]) => void
}) {
  return (
    <View>
      <Text style={styles.label}>Edge authentication</Text>
      <Text style={styles.hint}>
        Optional headers sent on the connection handshake, for tunnels protected by edge
        authentication (for example Cloudflare Access service tokens). Stored in this phone&apos;s
        keychain, never in pairing links. Leave all rows blank for none.
        {storedCount > 0 ? ` ${storedCount} header${storedCount === 1 ? '' : 's'} saved.` : ''}
      </Text>
      {rows.map((row, index) => (
        <View key={row.id} style={styles.authRow}>
          <TextInput
            style={[styles.input, styles.authName]}
            accessibilityLabel={`Header ${index + 1} name`}
            value={row.name}
            onChangeText={(value) =>
              onRowsChange(rows.map((r) => (r.id === row.id ? { ...r, name: value } : r)))
            }
            placeholder="CF-Access-Client-Id"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
          />
          <TextInput
            style={[styles.input, styles.authValue]}
            accessibilityLabel={`Header ${index + 1} value`}
            value={row.value}
            onChangeText={(value) =>
              onRowsChange(rows.map((r) => (r.id === row.id ? { ...r, value } : r)))
            }
            placeholder="Secret value"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
            secureTextEntry
          />
          <Pressable
            style={styles.authRemove}
            onPress={() =>
              onRowsChange(
                rows.length > 1 ? rows.filter((r) => r.id !== row.id) : [newEdgeAuthRow()]
              )
            }
            accessibilityRole="button"
            accessibilityLabel={`Remove header ${index + 1}`}
          >
            <Text style={styles.authRemoveText}>✕</Text>
          </Pressable>
        </View>
      ))}
      <Pressable
        style={styles.secondaryButton}
        onPress={() => onRowsChange([...rows, newEdgeAuthRow()])}
        accessibilityRole="button"
        accessibilityLabel="Add header"
      >
        <Text style={styles.secondaryButtonText}>Add header</Text>
      </Pressable>
      {error ? <Text style={styles.previewError}>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  label: {
    color: colors.textSecondary,
    fontSize: typography.metaSize,
    fontWeight: '500',
    marginTop: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.4
  },
  hint: {
    color: colors.textMuted,
    fontSize: typography.metaSize,
    lineHeight: 16
  },
  input: {
    backgroundColor: colors.bgPanel,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.row,
    color: colors.textPrimary,
    fontSize: typography.bodySize,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10
  },
  authRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center'
  },
  authName: {
    flex: 5
  },
  authValue: {
    flex: 6
  },
  authRemove: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center'
  },
  authRemoveText: {
    color: colors.textMuted,
    fontSize: typography.bodySize
  },
  secondaryButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.button,
    backgroundColor: colors.bgRaised
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: typography.bodySize,
    fontWeight: '500'
  },
  previewError: {
    marginTop: spacing.sm,
    color: colors.statusRed,
    fontSize: typography.bodySize
  }
})
