package com.uniovi.tests.pageobjects;

import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class PO_ListUsersView extends PO_NavView{
	
	
	
	static public void deleteUser1(WebDriver driver) {		
		driver.navigate().to("https://localhost:8081/usuarios");
		List<WebElement> elementos = driver.findElements(By.xpath("/html/body/div/div/table/tbody[1]/tr/td[4]/input"));
		elementos.get(0).click();
		By boton = By.className("btn");
		driver.findElement(boton).click();
		driver.navigate().to("https://localhost:8081/usuarios");
	}
	
	static public String getUser1(WebDriver driver) {		
		driver.navigate().to("https://localhost:8081/usuarios");
		List<WebElement> elementos = driver.findElements(By.xpath("/html/body/div/div/table/tbody[1]/tr/td[4]/input"));
		return elementos.get(0).getAttribute("id");
	}
	
	static public void deleteUserByName(WebDriver driver, String user) {		
		clickOptionId(driver, user, "id");
		By boton = By.className("btn");
		driver.findElement(boton).click();
		driver.navigate().to("https://localhost:8081/usuarios");
	}
	
	static public void deleteUsers(WebDriver driver, String[] users) {		
		driver.navigate().to("https://localhost:8081/usuarios");
		for(int i=0; i<users.length; i++) {
			clickOptionId(driver, users[i], "id");
		}
		By boton = By.className("btn");
		driver.findElement(boton).click();
		driver.navigate().to("https://localhost:8081/usuario/listado");
	}
	

}
