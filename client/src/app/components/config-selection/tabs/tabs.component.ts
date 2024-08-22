import { AfterContentInit, Component, ContentChildren, QueryList } from '@angular/core';
import { TabComponent } from '@app/components/config-selection/tab/tab.component';

@Component({
    selector: 'app-tabs',
    templateUrl: './tabs.component.html',
    styleUrls: ['./tabs.component.scss'],
})
export class TabsComponent implements AfterContentInit {
    @ContentChildren(TabComponent) tabs: QueryList<TabComponent>;

    get activeTab(): TabComponent {
        return this.tabs.filter((tab) => tab.active)[0];
    }

    ngAfterContentInit() {
        const activeTabs = this.tabs.filter((tab) => tab.active);
        if (!activeTabs.length) {
            this.activateTab(this.tabs.first);
        }
    }

    activateTab(tab: TabComponent) {
        this.tabs.toArray().forEach((item) => (item.active = false));
        tab.active = true;
    }
}
