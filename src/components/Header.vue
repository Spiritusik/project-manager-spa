<template>
  <header class="header">
    <div class="header__container container">
        <RouterLink class="header__logo" to="/">Home</RouterLink>
        <nav class="navigation">
          <ul>
            <li>
              <RouterLink class="navigation__item" to="/projects"><span class="navigation__text">Projects</span></RouterLink>
            </li>
          </ul>
        </nav>
    </div>
  </header>
</template>

<script setup lang="ts">

</script>

<style scoped lang="scss">
.header {
  position: sticky;
  top: 0;
  left: 0;

  display: flex;
  flex-direction: column;
  justify-content: center;

  height: var(--header-height);
  background-color: var(--header-color);
  box-shadow: 0 0 3px 0 #0000004D;

  &__container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__logo {
    font-size: 40px;
    font-weight: 900;
  }
}

.navigation {
  &__item {
    padding: 14px; 
    font-size: 24px;
  }

  &__text {
    position: relative;
    display: inline-block;

    &::before {
      content: "";
      display: block;
      position: absolute;
      bottom: -8px;
      left: 50%;

      border-radius: 2px;
      width: 0;
      height: 2px;
      background-color: var(--primary-color);
      transform: translateX(-50%);
      transition: all 230ms linear;
    }

    &:hover {
      &::before {
        width: 100%;
      }
    }
  }
}
</style>