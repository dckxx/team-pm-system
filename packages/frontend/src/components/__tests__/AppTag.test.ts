import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppTag from '@/components/AppTag.vue'

describe('AppTag.vue', () => {
  it('renders priority-P0 with danger color classes', () => {
    const wrapper = mount(AppTag, {
      props: { type: 'priority-P0' },
    })
    expect(wrapper.classes()).toContain('bg-danger-100')
    expect(wrapper.classes()).toContain('text-danger-600')
  })

  it('renders status-launched with success color classes', () => {
    const wrapper = mount(AppTag, {
      props: { type: 'status-launched' },
    })
    expect(wrapper.classes()).toContain('bg-success-100')
    expect(wrapper.classes()).toContain('text-success-600')
  })

  it('renders correct display label for priority-P0', () => {
    const wrapper = mount(AppTag, {
      props: { type: 'priority-P0' },
    })
    expect(wrapper.text()).toContain('P0 紧急')
  })
})
