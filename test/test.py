from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException
import unittest, time, re

class Test(unittest.TestCase):
    def setUp(self):
        self.driver = webdriver.Firefox()
        self.driver.implicitly_wait(5)
        self.base_url = "http://localhost:8080/"
        self.verificationErrors = []

    def test_(self):
        driver = self.driver
        driver.get(self.base_url)
        self.assertEquals(driver.title, "Routeless Backbone Contacts")
        # Clear test.
        driver.find_element_by_css_selector("button.clear").click()
        driver.switch_to_alert().accept()
        self.assertEqual(0, len(driver.find_elements_by_css_selector("#list li")))
        # Import test.
        driver.find_element_by_css_selector("button.import").click()
        driver.switch_to_alert().accept()
        self.assertEqual(100, len(driver.find_elements_by_css_selector("#list li")))
        # Add new test.
        driver.find_element_by_css_selector("button.create").click()
        driver.find_element_by_name("name").clear()
        driver.find_element_by_name("name").send_keys("AAAA")
        driver.find_element_by_css_selector("button.save").click()
        # Modify contact test.
        driver.find_element_by_xpath("//div[@id='list']/ul/li[2]").click()
        driver.find_element_by_name("address").clear()
        driver.find_element_by_name("address").send_keys("234 Drivers Grove\nAuckland")
        driver.find_element_by_css_selector("button.save").click()
        self.assertEqual("Adelle Sandell", driver.find_element_by_name("name").get_attribute("value"))
        # Delete contacts test.
        driver.find_element_by_xpath("//div[@id='list']/ul/li[3]").click()
        self.assertEqual("Adrienne Denton", driver.find_element_by_name("name").get_attribute("value"))
        driver.find_element_by_css_selector("button.delete").click()
        driver.find_element_by_css_selector("button.delete").click()
        self.assertEqual("Adelle Sandell", driver.find_element_by_name("name").get_attribute("value"))
        self.assertEqual(99, len(driver.find_elements_by_css_selector("#list li")))
        # Search tests.
        driver.find_element_by_css_selector("input.search").clear()
        driver.find_element_by_css_selector("input.search").send_keys("sm")
        driver.find_element_by_name("name").click()
        self.assertEqual(5, len(driver.find_elements_by_css_selector("#list li")))
        self.assertEqual("Alex Smith", driver.find_element_by_name("name").get_attribute("value"))
        driver.find_element_by_name("name").clear()
        driver.find_element_by_name("name").send_keys("Alex Amith")
        driver.find_element_by_css_selector("button.save").click()
        self.assertEqual(4, len(driver.find_elements_by_css_selector("#list li")))
        driver.find_element_by_css_selector("input.search").clear()
        driver.find_element_by_css_selector("input.search").send_keys("")
        driver.find_element_by_name("name").click()
        self.assertEqual(99, len(driver.find_elements_by_css_selector("#list li")))

    def is_element_present(self, how, what):
        try: self.driver.find_element(by=how, value=what)
        except NoSuchElementException, e: return False
        return True

    def tearDown(self):
        self.driver.quit()
        self.assertEqual([], self.verificationErrors)

if __name__ == "__main__":
    unittest.main()
