import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

export function useInfiniteScroll(
    loadMore: () => Promise<void>,
    options: {
        hasMore?: () => boolean
        isLoading?: () => boolean
        rootMargin?: string
        threshold?: number
        autoLoad?: boolean
        direction?: 'down' | 'up'

        onBeforeLoad?: () => void
        onAfterLoad?: () => void
    } = {}
) {
    const {
        hasMore = () => true,
        isLoading = () => false,
        rootMargin = '100px',
        threshold = 0.1,
        autoLoad = true,
        direction = 'down',
        onBeforeLoad,
        onAfterLoad
    } = options

    const triggerRef = ref<HTMLElement | null>(null)
    const containerRef = ref<HTMLElement | null>(null)
    const isObserving = ref(false)
    const isFirstLoad = ref(true)

    let observer: IntersectionObserver | null = null
    let scrollHeightBeforeLoad = 0
    let scrollTopBeforeLoad = 0

    async function load() {
        if (isLoading() || !hasMore()) return

        if (direction === 'up' && containerRef.value) {
            scrollHeightBeforeLoad = containerRef.value.scrollHeight
            scrollTopBeforeLoad = containerRef.value.scrollTop
            onBeforeLoad?.()
        }

        await loadMore()

        if (direction === 'up' && containerRef.value) {
            await nextTick()
            const newScrollHeight = containerRef.value.scrollHeight
            const heightDiff = newScrollHeight - scrollHeightBeforeLoad
            containerRef.value.scrollTop = scrollTopBeforeLoad + heightDiff
            onAfterLoad?.()
        }

        if (direction === 'down' && containerRef.value) {
            await nextTick()
            containerRef.value.scrollTop = containerRef.value.scrollHeight
        }
    }

    function setupObserver() {
        if (!triggerRef.value) return

        if (observer) {
            observer.disconnect()
            observer = null
        }

        const options: IntersectionObserverInit = {
            root: containerRef.value,
            rootMargin,
            threshold
        }

        observer = new IntersectionObserver(
            async ([entry]) => {
                if (entry && entry.isIntersecting && !isLoading() && hasMore()) {
                    await load()
                }
            },
            options
        )

        observer.observe(triggerRef.value)
        isObserving.value = true
    }

    function refresh() {
        if (observer && triggerRef.value) {
            observer.disconnect()
            observer.observe(triggerRef.value)
        }
    }

    function stopObserving() {
        if (observer) {
            observer.disconnect()
            observer = null
            isObserving.value = false
        }
    }

    function scrollToBottom(smooth: boolean = true) {
        if (!containerRef.value) return

        nextTick(() => {
            if (containerRef.value) {
                containerRef.value.scrollTo({
                    top: containerRef.value.scrollHeight,
                    behavior: smooth ? 'smooth' : 'auto'
                })
            }
        })
    }

    function scrollToTop(smooth: boolean = true) {
        if (!containerRef.value) return

        nextTick(() => {
            if (containerRef.value) {
                containerRef.value.scrollTo({
                    top: 0,
                    behavior: smooth ? 'smooth' : 'auto'
                })
            }
        })
    }

    onMounted(async () => {
        await nextTick()

        if (autoLoad && hasMore() && !isLoading()) {
            await load()
            isFirstLoad.value = false
        }

        setupObserver()
    })

    watch([hasMore, isLoading], () => {
        if (!isLoading() && hasMore()) {
            refresh()
        }
        if (!hasMore()) {
            stopObserving()
        }
    })

    onUnmounted(() => {
        stopObserving()
    })

    return {
        triggerRef,
        containerRef,

        isObserving,
        isFirstLoad,

        load,
        refresh,
        stopObserving,
        scrollToBottom,
        scrollToTop
    }
}