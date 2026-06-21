import type { App, Component } from 'vue'
import AppButton from './AppButton.vue'
import AppTag from './AppTag.vue'
import AppCard from './AppCard.vue'
import AppInput from './AppInput.vue'
import AppTable from './AppTable.vue'
import AppSelect from './AppSelect.vue'
import AppModal from './AppModal.vue'
import AppAvatar from './AppAvatar.vue'
import AppBadge from './AppBadge.vue'

const components: Record<string, Component> = {
  AppButton,
  AppTag,
  AppCard,
  AppInput,
  AppTable,
  AppSelect,
  AppModal,
  AppAvatar,
  AppBadge,
}

export function install(app: App): void {
  for (const [name, component] of Object.entries(components)) {
    app.component(name, component)
  }
}

export default install

export {
  AppButton,
  AppTag,
  AppCard,
  AppInput,
  AppTable,
  AppSelect,
  AppModal,
  AppAvatar,
  AppBadge,
}
