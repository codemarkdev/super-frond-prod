<template>
    <div class="calendario-selector">
      <!-- Input de fecha -->
      <div class="date-input-container" ref="dateContainer">
        <input 
          type="text" 
          class="input" 
          :placeholder="placeholder" 
          v-model="fechaInput" 
          @click="toggleCalendar" 
          readonly
        >
        <span class="icon is-right">
          <i class="mdi mdi-calendar"></i>
        </span>
      </div>
    
      <!-- Calendario flotante - Se renderiza en un div fuera del flujo normal -->
      <div v-if="showCalendar" ref="calendarPortal"></div>
    </div>
    </template>
    
    <script>
    export default {
    name: 'CalendarioSelector',
    props: {
      value: {
        type: Date,
        default: null
      },
      placeholder: {
        type: String,
        default: 'dd/mm/aaaa'
      }
    },
    data() {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
    
      return {
        fechaInput: '',
        showCalendar: false,
        calendarMonth: currentMonth,
        calendarYear: currentYear,
        calendarStyle: {
          top: '0px',
          left: '0px'
        },
        meses: [
          "enero",
          "febrero",
          "marzo",
          "abril",
          "mayo",
          "junio",
          "julio",
          "agosto",
          "septiembre",
          "octubre",
          "noviembre",
          "diciembre",
        ],
        diasSemana: ["L", "M", "X", "J", "V", "S", "D"],
        calendarElement: null,
        portalTarget: null
      };
    },
    computed: {
      nombreMes() {
        return this.meses[this.calendarMonth];
      },
      calendarDays() {
        return this.getCalendarDays(this.calendarYear, this.calendarMonth);
      }
    },
    watch: {
      value: {
        handler(newVal) {
          if (newVal) {
            this.fechaInput = this.formatDateForInput(newVal);
            this.calendarMonth = newVal.getMonth();
            this.calendarYear = newVal.getFullYear();
          } else {
            this.fechaInput = '';
          }
        },
        immediate: true
      },
      showCalendar(val) {
        if (val) {
          this.createCalendarElement();
        } else {
          this.removeCalendarElement();
        }
      }
    },
    mounted() {
      // Inicializar la fecha de entrada si hay un valor
      if (this.value) {
        this.fechaInput = this.formatDateForInput(this.value);
      }
      
      // Agregar eventos globales
      document.addEventListener('click', this.handleClickOutside);
      window.addEventListener('resize', this.updateCalendarPosition);
      window.addEventListener('scroll', this.updateCalendarPosition);
      
      // Crear el elemento portal target si no existe
      if (!document.getElementById('calendar-portal-target')) {
        this.portalTarget = document.createElement('div');
        this.portalTarget.id = 'calendar-portal-target';
        this.portalTarget.style.position = 'absolute';
        this.portalTarget.style.top = '0';
        this.portalTarget.style.left = '0';
        this.portalTarget.style.width = '100%';
        this.portalTarget.style.height = '0';
        this.portalTarget.style.overflow = 'visible';
        this.portalTarget.style.zIndex = '9999';
        document.body.appendChild(this.portalTarget);
      } else {
        this.portalTarget = document.getElementById('calendar-portal-target');
      }
    },
    beforeDestroy() {
      // Limpiar eventos
      document.removeEventListener('click', this.handleClickOutside);
      window.removeEventListener('resize', this.updateCalendarPosition);
      window.removeEventListener('scroll', this.updateCalendarPosition);
      
      // Eliminar el calendario si existe
      this.removeCalendarElement();
    },
    methods: {
      toggleCalendar() {
        this.showCalendar = !this.showCalendar;
      },
    
      createCalendarElement() {
        // Crear el elemento del calendario
        this.calendarElement = document.createElement('div');
        this.calendarElement.className = 'floating-calendar';
        this.calendarElement.style.position = 'fixed';
        this.calendarElement.style.zIndex = '9999';
        this.calendarElement.style.backgroundColor = 'white';
        this.calendarElement.style.border = '1px solid #dbdbdb';
        this.calendarElement.style.borderRadius = '4px';
        this.calendarElement.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        this.calendarElement.style.padding = '10px'; // Reducido de 15px a 10px
        this.calendarElement.style.width = '240px'; // Reducido de 300px a 240px
        
        // Renderizar el contenido del calendario
        this.renderCalendarContent();
        
        // Añadir al DOM
        this.portalTarget.appendChild(this.calendarElement);
        
        // Posicionar el calendario
        this.$nextTick(() => {
          this.positionCalendar();
        });
      },
      
      removeCalendarElement() {
        if (this.calendarElement && this.calendarElement.parentNode) {
          this.calendarElement.parentNode.removeChild(this.calendarElement);
          this.calendarElement = null;
        }
      },
      
      renderCalendarContent() {
        if (!this.calendarElement) return;
        
        // Crear el contenido del calendario
        let content = `
          <div class="calendar-header">
            <div class="month-year">
              ${this.nombreMes} de ${this.calendarYear}
              <div class="nav-buttons">
                <button class="prev-month">←</button>
                <button class="next-month">→</button>
              </div>
            </div>
          </div>
          <div class="weekdays">
            ${this.diasSemana.map(day => `<div>${day}</div>`).join('')}
          </div>
          <div class="days">
            ${this.calendarDays.map(day => {
              const classes = ['day'];
              if (day.otherMonth) classes.push('other-month');
              if (this.isSelectedDate(day.date)) classes.push('selected');
              if (this.isToday(day.date)) classes.push('today');
              
              return `<div class="${classes.join(' ')}" data-date="${day.date.toISOString()}">${day.day}</div>`;
            }).join('')}
          </div>
          <div class="calendar-footer">
            <button class="btn-clear">Borrar</button>
            <button class="btn-today">Hoy</button>
          </div>
        `;
        
        this.calendarElement.innerHTML = content;
        
        // Añadir event listeners
        this.calendarElement.querySelector('.prev-month').addEventListener('click', this.prevMonth);
        this.calendarElement.querySelector('.next-month').addEventListener('click', this.nextMonth);
        this.calendarElement.querySelector('.btn-clear').addEventListener('click', this.clearDate);
        this.calendarElement.querySelector('.btn-today').addEventListener('click', this.setTodayAsDate);
        
        // Añadir event listeners a los días
        const dayElements = this.calendarElement.querySelectorAll('.day');
        dayElements.forEach(el => {
          el.addEventListener('click', (e) => {
            const dateStr = e.target.getAttribute('data-date');
            if (dateStr) {
              this.selectDate(new Date(dateStr));
            }
          });
        });
    
        // Aplicar estilos adicionales para reducir el tamaño
        const styleElement = document.createElement('style');
        styleElement.textContent = `
          .floating-calendar .calendar-header {
            margin-bottom: 8px;
            font-size: 0.9rem;
          }
          .floating-calendar .month-year {
            font-size: 0.9rem;
          }
          .floating-calendar .weekdays {
            font-size: 0.8rem;
          }
          .floating-calendar .days {
            gap: 2px;
          }
          .floating-calendar .day {
            height: 28px;
            font-size: 0.8rem;
          }
          .floating-calendar .calendar-footer {
            margin-top: 8px;
            padding-top: 8px;
          }
          .floating-calendar .btn-clear,
          .floating-calendar .btn-today {
            font-size: 0.8rem;
            padding: 3px 8px;
          }
        `;
        this.calendarElement.appendChild(styleElement);
      },
    
      positionCalendar() {
        if (!this.calendarElement || !this.$refs.dateContainer) return;
        
        const inputEl = this.$refs.dateContainer;
        const rect = inputEl.getBoundingClientRect();
        const calendarHeight = this.calendarElement.offsetHeight;
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;
        const calendarWidth = this.calendarElement.offsetWidth;
    
        // Verificar si hay suficiente espacio debajo
        const spaceBelow = windowHeight - rect.bottom;
        const showBelow = spaceBelow >= calendarHeight;
    
        // Calcular posición horizontal para evitar que se salga de la pantalla
        let leftPos = rect.left;
        if (leftPos + calendarWidth > windowWidth) {
          leftPos = windowWidth - calendarWidth - 10; // 10px de margen
        }
        if (leftPos < 0) {
          leftPos = 10; // 10px de margen
        }
    
        // Aplicar posición
        this.calendarElement.style.top = showBelow ? `${rect.bottom}px` : `${rect.top - calendarHeight}px`;
        this.calendarElement.style.left = `${leftPos}px`;
      },
    
      updateCalendarPosition() {
        if (this.showCalendar) {
          this.positionCalendar();
        }
      },
    
      handleClickOutside(event) {
        // Cerrar calendario si se hace clic fuera
        if (this.showCalendar &&
          this.calendarElement &&
          !this.calendarElement.contains(event.target) &&
          this.$refs.dateContainer &&
          !this.$refs.dateContainer.contains(event.target)) {
          this.showCalendar = false;
        }
      },
    
      getCalendarDays(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
    
        // Obtener el día de la semana del primer día (0 = domingo, 1 = lunes, ..., 6 = sábado)
        let firstDayOfWeek = firstDay.getDay();
        // Ajustar para que lunes sea 0
        firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
        const days = [];
    
        // Días del mes anterior
        const prevMonth = month === 0 ? 11 : month - 1;
        const prevMonthYear = month === 0 ? year - 1 : year;
        const daysInPrevMonth = new Date(prevMonthYear, prevMonth + 1, 0).getDate();
    
        for (let i = 0; i < firstDayOfWeek; i++) {
          const day = daysInPrevMonth - firstDayOfWeek + i + 1;
          days.push({
            day,
            date: new Date(prevMonthYear, prevMonth, day),
            otherMonth: true,
            id: `prev-${day}`
          });
        }
    
        // Días del mes actual
        for (let i = 1; i <= daysInMonth; i++) {
          days.push({
            day: i,
            date: new Date(year, month, i),
            otherMonth: false,
            id: `current-${i}`
          });
        }
    
        // Días del mes siguiente
        const nextMonth = month === 11 ? 0 : month + 1;
        const nextMonthYear = month === 11 ? year + 1 : year;
        const remainingDays = 42 - days.length; // 6 filas x 7 días
    
        for (let i = 1; i <= remainingDays; i++) {
          days.push({
            day: i,
            date: new Date(nextMonthYear, nextMonth, i),
            otherMonth: true,
            id: `next-${i}`
          });
        }
    
        return days;
      },
    
      isSelectedDate(date) {
        if (!this.value) return false;
    
        return date.getDate() === this.value.getDate() &&
          date.getMonth() === this.value.getMonth() &&
          date.getFullYear() === this.value.getFullYear();
      },
    
      isToday(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear();
      },
    
      selectDate(date) {
        this.$emit('input', new Date(date));
        this.fechaInput = this.formatDateForInput(date);
        this.showCalendar = false;
      },
    
      prevMonth() {
        if (this.calendarMonth === 0) {
          this.calendarMonth = 11;
          this.calendarYear--;
        } else {
          this.calendarMonth--;
        }
        
        // Re-renderizar el calendario
        this.renderCalendarContent();
      },
    
      nextMonth() {
        if (this.calendarMonth === 11) {
          this.calendarMonth = 0;
          this.calendarYear++;
        } else {
          this.calendarMonth++;
        }
        
        // Re-renderizar el calendario
        this.renderCalendarContent();
      },
    
      clearDate() {
        this.$emit('input', null);
        this.fechaInput = "";
        this.showCalendar = false;
      },
    
      setTodayAsDate() {
        const today = new Date();
        this.$emit('input', today);
        this.fechaInput = this.formatDateForInput(today);
        this.calendarMonth = today.getMonth();
        this.calendarYear = today.getFullYear();
        this.showCalendar = false;
      },
    
      formatDateForInput(date) {
        if (!date) return '';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
    }
    };
    </script>
    
    <style>
    /* Estilos para el contenedor de entrada de fecha */
    .calendario-selector {
    position: relative;
    width: 100%;
    }
    
    .date-input-container {
    position: relative;
    width: 100%;
    }
    
    .date-input-container .icon {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    }
    
    /* Estilos para el calendario flotante - Ahora se aplican globalmente */
    .floating-calendar {
    background-color: white;
    border: 1px solid #dbdbdb;
    border-radius: 4px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 10px; /* Reducido de 15px a 10px */
    width: 240px; /* Reducido de 300px a 240px */
    }
    
    .calendar-header {
    margin-bottom: 8px; /* Reducido de 15px a 8px */
    text-align: center;
    }
    
    .month-year {
    font-weight: bold;
    position: relative;
    font-size: 0.9rem; /* Reducido de 1.1rem a 0.9rem */
    text-transform: capitalize;
    }
    
    .nav-buttons {
    position: absolute;
    right: 0;
    top: 0;
    display: flex;
    gap: 5px; /* Reducido de 10px a 5px */
    }
    
    .nav-buttons button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0 3px; /* Reducido de 5px a 3px */
    font-size: 1rem; /* Reducido de 1.2rem a 1rem */
    color: #3273dc;
    }
    
    .weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    font-weight: bold;
    margin-bottom: 5px; /* Reducido de 10px a 5px */
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 3px; /* Reducido de 5px a 3px */
    font-size: 0.8rem; /* Reducido */
    }
    
    .days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px; /* Reducido de 5px a 2px */
    }
    
    .day {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 28px; /* Reducido de 35px a 28px */
    cursor: pointer;
    border-radius: 4px;
    font-size: 0.8rem; /* Reducido de 14px a 0.8rem */
    }
    
    .day:hover {
    background-color: #f5f5f5;
    }
    
    .day.other-month {
    color: #b5b5b5;
    }
    
    .day.selected {
    background-color: #3273dc;
    color: white;
    }
    
    .day.today {
    border: 1px solid #3273dc;
    }
    
    .calendar-footer {
    display: flex;
    justify-content: space-between;
    margin-top: 8px; /* Reducido de 15px a 8px */
    padding-top: 8px; /* Reducido de 10px a 8px */
    border-top: 1px solid #f0f0f0;
    }
    
    .btn-clear,
    .btn-today {
    background: none;
    border: none;
    cursor: pointer;
    color: #3273dc;
    padding: 3px 8px; /* Reducido de 5px 10px a 3px 8px */
    border-radius: 4px;
    font-size: 0.8rem; /* Reducido */
    }
    
    .btn-clear:hover,
    .btn-today:hover {
    background-color: #f0f0f0;
    }
    
    .btn-today {
    font-weight: bold;
    }
    
    @media screen and (max-width: 768px) {
    .floating-calendar {
      width: 220px; /* Reducido de 280px a 220px */
      left: 50% !important;
      transform: translateX(-50%);
    }
    }
    </style>