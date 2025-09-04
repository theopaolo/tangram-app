<script>
  /**
   * Reusable Breadcrumb Component
   *
   * @typedef {Object} BreadcrumbItem
   * @property {string} label - The text to display
   * @property {string} [href] - Optional link URL, if provided the item becomes clickable
   * @property {boolean} [current] - If true, marks this item as current (underlined)
   * @property {boolean} [disabled] - If true, marks this item as disabled (low opacity)
   */

  /**
   * @type {{ items: BreadcrumbItem[] }}
   */
  let { items = [] } = $props();
</script>

<div class="bread fixed left-[20px] bottom-[8px] text-mini tracking-[5%]">
  {#each items as item, index}
    {#if index > 0}
      <span class="separator"> > </span>
    {/if}

    {#if item.href}
      <a
        href={item.href}
        class="breadcrumb-item"
        class:current={item.current}
        class:desactivate={item.disabled}
      >
        {item.label}
      </a>
    {:else}
      <span
        class="breadcrumb-item"
        class:current={item.current}
        class:desactivate={item.disabled}
      >
        {item.label}
      </span>
    {/if}
  {/each}
</div>

<style>
  .breadcrumb-item {
    color: inherit;
    text-decoration: none;
  }

  .breadcrumb-item:hover:not(.desactivate) {
    opacity: 0.8;
  }
</style>
