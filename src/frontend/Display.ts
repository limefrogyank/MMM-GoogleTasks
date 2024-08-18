//import { format, formatDistanceToNowStrict, parseJSON, addDays, isBefore, isAfter } from "date-fns";
import { AppearanceConfig, Config } from "../types/Config";
import { TaskData, Task } from "../types/Display";
import { ModuleNotification } from "../types/ModuleNotification";

const performCustomSort = (originalTasks: Task[]): Task[] => {
  const temp: Task[] = [];
  originalTasks
    .filter((task) => task.parent === undefined) // Filter tasks to only parent tasks
    .sort((a, b) => (a.position > b.position ? 1 : -1)) // Sort parent tasks by position
    .forEach((task) => {
      // Map over parents to create reordered list of tasks
      temp.push(task);

      // Loop through all tasks to find and sort subtasks for each parent
      const subList: Task[] = [];
      originalTasks.forEach((subtask) => {
        if (subtask.parent === task.id) {
          subList.push(subtask);
        }
      });
      subList.sort((a, b) => (a.position > b.position ? 1 : -1));
      temp.push(...subList);
    });
  return temp;
};

const getOrderedTasks = (originalTasks: Task[], config: AppearanceConfig): Task[] => {
  // Sort attributes like they are shown in the Tasks app
  switch (config.ordering) {
    case "myorder":
      return performCustomSort(originalTasks);

    case "due":
    case "title":
    case "updated":
      return originalTasks.sort((a, b) => {
        const aValue = a[config.ordering as keyof Task] ?? "";
        const bValue = b[config.ordering as keyof Task] ?? "";

        return aValue > bValue ? 1 : -1;
      });
  }
  return originalTasks;
};

// const getDateSpan = (item: Task, config: AppearanceConfig): HTMLElement | undefined => {
//   if (!item.due) {
//     return undefined;
//   }

//   const dateWrapper = document.createElement("span");
//   const classNames = ["date", "light"];
//   const dueDate = addDays(parseJSON(item.due), 1);
//   const now = new Date();
//   const next24 = addDays(now, 1);

//   // overdue
//   if (isBefore(dueDate, now)) {
//     classNames.push("overdue");
//   }

//   // due in the next day
//   if (isBefore(dueDate, next24) && isAfter(dueDate, now)) {
//     classNames.push("soon");
//   }

//   if (isAfter(dueDate, next24)) {
//     classNames.push("upcoming");
//   }

//   if (config.useRelativeDate) {
//     dateWrapper.innerHTML = formatDistanceToNowStrict(dueDate, { addSuffix: true });
//   } else {
//     dateWrapper.innerHTML = format(dueDate, config.dateFormat);
//   }

//   dateWrapper.className = classNames.join(" ");
//   return dateWrapper;
// };

const getItemView = (item: Task, config: AppearanceConfig, module: Module.ModuleProperties<Config>): HTMLElement => {
  const itemWrapper = document.createElement("li");
  itemWrapper.className = "item";




  const titleWrapper = document.createElement("span");

  titleWrapper.innerText = item.title;
  titleWrapper.className = "title";
  if (item.status === 'completed') {
    titleWrapper.className += " completed";
  }
  if (item.parent) {
    titleWrapper.className += " child";

    itemWrapper.onclick = function () {
      titleWrapper.classList.add('pending');
      if (item.status === 'completed') {
        item.status = 'needsAction';
      } else {
        item.status = 'completed';
      }
      //item.status = 'completed';
      //titleWrapper.className += ' completed';
      module.sendSocketNotification(ModuleNotification.COMPLETE, item);

    }

  }
  titleWrapper.innerText = item.title;



  //config;
  // const dateWrapper = getDateSpan(item, config);

  // if (dateWrapper) {
  //   itemWrapper.appendChild(dateWrapper);
  // }

  itemWrapper.appendChild(titleWrapper);
  return itemWrapper;
};

export const getTaskView = (taskData: TaskData, config: AppearanceConfig, module: Module.ModuleProperties<Config>): HTMLElement => {
  const wrapper = document.createElement("ul");
  wrapper.style.maxWidth = config.maxWidth ?? "auto";

  const tasks: Task[] = getOrderedTasks(taskData.tasks, config);

  tasks.forEach((item) => {
    const itemWrapper = getItemView(item, config, module);

    wrapper.appendChild(itemWrapper);
  });

  return wrapper;
};

export const getLoadingView = (config: AppearanceConfig): HTMLElement => {
  const wrapper = document.createElement("div");
  wrapper.className = "wrapper";
  wrapper.style.maxWidth = config.maxWidth ?? "auto";

  wrapper.innerHTML = "Loading Google Tasks";
  wrapper.classList.add("bright", "light", "small");
  return wrapper;
};
