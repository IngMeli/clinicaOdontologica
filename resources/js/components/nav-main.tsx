import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { menuIcon } from '@/lib/menu-icons';
import type { MenuItem } from '@/types';

export function NavMain({ items }: { items: MenuItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();
    const directItems = items.filter((item) => item.children.length === 0);
    const groups = items.filter((item) => item.children.length > 0);

    return (
        <>
            {directItems.length > 0 && (
                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>Principal</SidebarGroupLabel>
                    <SidebarMenu>
                        {directItems.map((item) => {
                            const Icon = menuIcon(item.icon);

                            return (
                                <SidebarMenuItem key={item.id}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={
                                            item.url
                                                ? isCurrentUrl(item.url)
                                                : false
                                        }
                                        tooltip={{ children: item.label }}
                                    >
                                        <Link href={item.url ?? '#'} prefetch>
                                            <Icon />
                                            <span>{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            )}

            {groups.map((group) => (
                <SidebarGroup key={group.id} className="px-2 py-0">
                    <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                    <SidebarMenu>
                        {group.children.map((item) => {
                            const Icon = menuIcon(item.icon);

                            return (
                                <SidebarMenuItem key={item.id}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={
                                            item.url
                                                ? isCurrentUrl(item.url)
                                                : false
                                        }
                                        tooltip={{ children: item.label }}
                                    >
                                        <Link href={item.url ?? '#'} prefetch>
                                            <Icon />
                                            <span>{item.label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </>
    );
}
